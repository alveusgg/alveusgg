import crypto from "crypto";

const PAD_SIZE = { aes128gcm: 1, aesgcm: 2, aesgcm128: 1 };
const TAG_LENGTH = 16;
const KEY_LENGTH = 16;
const NONCE_LENGTH = 12;
const SHA_256_LENGTH = 32;
const MODE_ENCRYPT = "encrypt";
const MODE_DECRYPT = "decrypt";

let keylog;
if (process.env.ECE_KEYLOG === "1") {
  keylog = function (m, k) {
    console.warn(m + " [" + k.length + "]: " + base64.encode(k));
    return k;
  };
} else {
  keylog = function (m, k) {
    return k;
  };
}

/* Optionally base64 decode something. */
function decode(b) {
  if (typeof b === "string") {
    return base64.decode(b);
  }
  return b;
}

function HMAC_hash(key, input) {
  const hmac = crypto.createHmac("sha256", key);
  hmac.update(input);
  return hmac.digest();
}

/* HKDF as defined in RFC5869, using SHA-256 */
function HKDF_extract(salt, ikm) {
  keylog("salt", salt);
  keylog("ikm", ikm);
  return keylog("extract", HMAC_hash(salt, ikm));
}

function HKDF_expand(prk, info, l) {
  keylog("prk", prk);
  keylog("info", info);
  let output = new Buffer(0);
  let T = new Buffer(0);
  info = new Buffer(info, "ascii");
  let counter = 0;
  const cbuf = new Buffer(1);
  while (output.length < l) {
    cbuf.writeUIntBE(++counter, 0, 1);
    T = HMAC_hash(prk, Buffer.concat([T, info, cbuf]));
    output = Buffer.concat([output, T]);
  }

  return keylog("expand", output.slice(0, l));
}

function HKDF(salt, ikm, info, len) {
  return HKDF_expand(HKDF_extract(salt, ikm), info, len);
}

function info(base, context) {
  const result = Buffer.concat([
    new Buffer("Content-Encoding: " + base + "\0", "ascii"),
    context,
  ]);
  keylog("info " + base, result);
  return result;
}

function lengthPrefix(buffer) {
  const b = Buffer.concat([new Buffer(2), buffer]);
  b.writeUIntBE(buffer.length, 0, 2);
  return b;
}

function extractDH(header, mode) {
  const key = header.privateKey;
  let senderPubKey, receiverPubKey;
  if (mode === MODE_ENCRYPT) {
    senderPubKey = key.getPublicKey();
    receiverPubKey = header.dh;
  } else if (mode === MODE_DECRYPT) {
    senderPubKey = header.dh;
    receiverPubKey = key.getPublicKey();
  } else {
    throw new Error(
      "Unknown mode only " +
        MODE_ENCRYPT +
        " and " +
        MODE_DECRYPT +
        " supported"
    );
  }
  return {
    secret: key.computeSecret(header.dh),
    context: Buffer.concat([
      Buffer.from(header.keylabel, "ascii"),
      Buffer.from([0]),
      lengthPrefix(receiverPubKey), // user agent
      lengthPrefix(senderPubKey), // application server
    ]),
  };
}

function extractSecretAndContext(header, mode) {
  let result = { secret: null, context: new Buffer(0) };
  if (header.key) {
    result.secret = header.key;
    if (result.secret.length !== KEY_LENGTH) {
      throw new Error("An explicit key must be " + KEY_LENGTH + " bytes");
    }
  } else if (header.dh) {
    // receiver/decrypt
    result = extractDH(header, mode);
  } else if (typeof header.keyid !== undefined) {
    result.secret = header.keymap[header.keyid];
  }
  if (!result.secret) {
    throw new Error("Unable to determine key");
  }
  keylog("secret", result.secret);
  keylog("context", result.context);
  if (header.authSecret) {
    result.secret = HKDF(
      header.authSecret,
      result.secret,
      info("auth", new Buffer(0)),
      SHA_256_LENGTH
    );
    keylog("authsecret", result.secret);
  }
  return result;
}

function webpushSecret(header, mode) {
  if (!header.authSecret) {
    throw new Error("No authentication secret for webpush");
  }
  keylog("authsecret", header.authSecret);

  let remotePubKey, senderPubKey, receiverPubKey;
  if (mode === MODE_ENCRYPT) {
    senderPubKey = header.privateKey.getPublicKey();
    remotePubKey = receiverPubKey = header.dh;
  } else if (mode === MODE_DECRYPT) {
    remotePubKey = senderPubKey = header.keyid;
    receiverPubKey = header.privateKey.getPublicKey();
  } else {
    throw new Error(
      "Unknown mode only " +
        MODE_ENCRYPT +
        " and " +
        MODE_DECRYPT +
        " supported"
    );
  }
  keylog("remote pubkey", remotePubKey);
  keylog("sender pubkey", senderPubKey);
  keylog("receiver pubkey", receiverPubKey);
  return keylog(
    "secret dh",
    HKDF(
      header.authSecret,
      header.privateKey.computeSecret(remotePubKey),
      Buffer.concat([
        Buffer.from("WebPush: info\0"),
        receiverPubKey,
        senderPubKey,
      ]),
      SHA_256_LENGTH
    )
  );
}

function extractSecret(header, mode) {
  if (header.key) {
    if (header.key.length !== KEY_LENGTH) {
      throw new Error("An explicit key must be " + KEY_LENGTH + " bytes");
    }
    return keylog("secret key", header.key);
  }

  if (!header.privateKey) {
    // Lookup based on keyid
    const key = header.keymap && header.keymap[header.keyid];
    if (!key) {
      throw new Error('No saved key (keyid: "' + header.keyid + '")');
    }
    return key;
  }

  return webpushSecret(header, mode);
}

function deriveKeyAndNonce(header, mode) {
  if (!header.salt) {
    throw new Error("must include a salt parameter for " + header.version);
  }
  let keyInfo;
  let nonceInfo;
  let secret;
  if (header.version === "aesgcm128") {
    // really old
    keyInfo = "Content-Encoding: aesgcm128";
    nonceInfo = "Content-Encoding: nonce";
    secret = extractSecretAndContext(header, mode).secret;
  } else if (header.version === "aesgcm") {
    // old
    const s = extractSecretAndContext(header, mode);
    keyInfo = info("aesgcm", s.context);
    nonceInfo = info("nonce", s.context);
    secret = s.secret;
  } else if (header.version === "aes128gcm") {
    // latest
    keyInfo = Buffer.from("Content-Encoding: aes128gcm\0");
    nonceInfo = Buffer.from("Content-Encoding: nonce\0");
    secret = extractSecret(header, mode);
  } else {
    throw new Error("Unable to set context for mode " + params.version);
  }
  const prk = HKDF_extract(header.salt, secret);
  const result = {
    key: HKDF_expand(prk, keyInfo, KEY_LENGTH),
    nonce: HKDF_expand(prk, nonceInfo, NONCE_LENGTH),
  };
  keylog("key", result.key);
  keylog("nonce base", result.nonce);
  return result;
}

/* Parse command-line arguments. */
function parseParams(params) {
  const header = {};

  header.version = params.version || "aes128gcm";
  header.rs = parseInt(params.rs, 10);
  if (isNaN(header.rs)) {
    header.rs = 4096;
  }
  let overhead = PAD_SIZE[header.version];
  if (header.version === "aes128gcm") {
    overhead += TAG_LENGTH;
  }
  if (header.rs <= overhead) {
    throw new Error("The rs parameter has to be greater than " + overhead);
  }

  if (params.salt) {
    header.salt = decode(params.salt);
    if (header.salt.length !== KEY_LENGTH) {
      throw new Error("The salt parameter must be " + KEY_LENGTH + " bytes");
    }
  }
  header.keyid = params.keyid;
  if (params.key) {
    header.key = decode(params.key);
  } else {
    header.privateKey = params.privateKey;
    if (!header.privateKey) {
      header.keymap = params.keymap;
    }
    if (header.version !== "aes128gcm") {
      header.keylabel = params.keylabel || "P-256";
    }
    if (params.dh) {
      header.dh = decode(params.dh);
    }
  }
  if (params.authSecret) {
    header.authSecret = decode(params.authSecret);
  }
  return header;
}

function generateNonce(base, counter) {
  const nonce = new Buffer(base);
  const m = nonce.readUIntBE(nonce.length - 6, 6);
  const x =
    ((m ^ counter) & 0xffffff) +
    (((m / 0x1000000) ^ (counter / 0x1000000)) & 0xffffff) * 0x1000000;
  nonce.writeUIntBE(x, nonce.length - 6, 6);
  keylog("nonce" + counter, nonce);
  return nonce;
}

/* Used when decrypting aes128gcm to populate the header values. Modifies the
 * header values in place and returns the size of the header. */
function readHeader(buffer, header) {
  const idsz = buffer.readUIntBE(20, 1);
  header.salt = buffer.slice(0, KEY_LENGTH);
  header.rs = buffer.readUIntBE(KEY_LENGTH, 4);
  header.keyid = buffer.slice(21, 21 + idsz);
  return 21 + idsz;
}

function unpadLegacy(data, version) {
  const padSize = PAD_SIZE[version];
  const pad = data.readUIntBE(0, padSize);
  if (pad + padSize > data.length) {
    throw new Error("padding exceeds block size");
  }
  keylog("padding", data.slice(0, padSize + pad));
  const padCheck = new Buffer(pad);
  padCheck.fill(0);
  if (padCheck.compare(data.slice(padSize, padSize + pad)) !== 0) {
    throw new Error("invalid padding");
  }
  return data.slice(padSize + pad);
}

function unpad(data, last) {
  let i = data.length - 1;
  while (i >= 0) {
    if (data[i]) {
      if (last) {
        if (data[i] !== 2) {
          throw new Error("last record needs to start padding with a 2");
        }
      } else {
        if (data[i] !== 1) {
          throw new Error("last record needs to start padding with a 2");
        }
      }
      return data.slice(0, i);
    }
    --i;
  }
  throw new Error("all zero plaintext");
}

function decryptRecord(key, counter, buffer, header, last) {
  keylog("decrypt", buffer);
  const nonce = generateNonce(key.nonce, counter);
  const gcm = crypto.createDecipheriv(AES_GCM, key.key, nonce);
  gcm.setAuthTag(buffer.slice(buffer.length - TAG_LENGTH));
  let data = gcm.update(buffer.slice(0, buffer.length - TAG_LENGTH));
  data = Buffer.concat([data, gcm.final()]);
  keylog("decrypted", data);
  if (header.version !== "aes128gcm") {
    return unpadLegacy(data, header.version);
  }
  return unpad(data, last);
}

/**
 * Decrypt some bytes.  This uses the parameters to determine the key and block
 * size, which are described in the draft.  Binary values are base64url encoded.
 *
 * |params.version| contains the version of encoding to use: aes128gcm is the latest,
 * but aesgcm and aesgcm128 are also accepted (though the latter two might
 * disappear in a future release).  If omitted, assume aes128gcm.
 *
 * If |params.key| is specified, that value is used as the key.
 *
 * If the version is aes128gcm, the keyid is extracted from the header and used
 * as the ECDH public key of the sender.  For version aesgcm and aesgcm128,
 * |params.dh| needs to be provided with the public key of the sender.
 *
 * The |params.privateKey| includes the private key of the receiver.
 */
function decrypt(buffer, params) {
  const header = parseParams(params);
  if (header.version === "aes128gcm") {
    const headerLength = readHeader(buffer, header);
    buffer = buffer.slice(headerLength);
  }
  const key = deriveKeyAndNonce(header, MODE_DECRYPT);
  let start = 0;
  let result = new Buffer(0);

  let chunkSize = header.rs;
  if (header.version !== "aes128gcm") {
    chunkSize += TAG_LENGTH;
  }

  for (let i = 0; start < buffer.length; ++i) {
    let end = start + chunkSize;
    if (header.version !== "aes128gcm" && end === buffer.length) {
      throw new Error("Truncated payload");
    }
    end = Math.min(end, buffer.length);
    if (end - start <= TAG_LENGTH) {
      throw new Error("Invalid block: too small at " + i);
    }
    const block = decryptRecord(
      key,
      i,
      buffer.slice(start, end),
      header,
      end >= buffer.length
    );
    result = Buffer.concat([result, block]);
    start = end;
  }
  return result;
}

function encryptRecord(key, counter, buffer, pad, header, last) {
  keylog("encrypt", buffer);
  pad = pad || 0;
  const nonce = generateNonce(key.nonce, counter);
  const gcm = crypto.createCipheriv(AES_GCM, key.key, nonce);

  const ciphertext = [];
  const padSize = PAD_SIZE[header.version];
  const padding = new Buffer(pad + padSize);
  padding.fill(0);

  if (header.version !== "aes128gcm") {
    padding.writeUIntBE(pad, 0, padSize);
    keylog("padding", padding);
    ciphertext.push(gcm.update(padding));
    ciphertext.push(gcm.update(buffer));

    if (!last && padding.length + buffer.length < header.rs) {
      throw new Error("Unable to pad to record size");
    }
  } else {
    ciphertext.push(gcm.update(buffer));
    padding.writeUIntBE(last ? 2 : 1, 0, 1);
    keylog("padding", padding);
    ciphertext.push(gcm.update(padding));
  }

  gcm.final();
  const tag = gcm.getAuthTag();
  if (tag.length !== TAG_LENGTH) {
    throw new Error("invalid tag generated");
  }
  ciphertext.push(tag);
  return keylog("encrypted", Buffer.concat(ciphertext));
}

function writeHeader(header) {
  const ints = new Buffer(5);
  const keyid = Buffer.from(header.keyid || []);
  if (keyid.length > 255) {
    throw new Error("keyid is too large");
  }
  ints.writeUIntBE(header.rs, 0, 4);
  ints.writeUIntBE(keyid.length, 4, 1);
  return Buffer.concat([header.salt, ints, keyid]);
}

/**
 * Encrypt some bytes.  This uses the parameters to determine the key and block
 * size, which are described in the draft.
 *
 * |params.version| contains the version of encoding to use: aes128gcm is the latest,
 * but aesgcm and aesgcm128 are also accepted (though the latter two might
 * disappear in a future release).  If omitted, assume aes128gcm.
 *
 * If |params.key| is specified, that value is used as the key.
 *
 * For Diffie-Hellman (WebPush), |params.dh| includes the public key of the
 * receiver.  |params.privateKey| is used to establish a shared secret.  Key
 * pairs can be created using |crypto.createECDH()|.
 */
function encrypt(buffer, params) {
  if (!Buffer.isBuffer(buffer)) {
    throw new Error("buffer argument must be a Buffer");
  }
  const header = parseParams(params);
  if (!header.salt) {
    header.salt = crypto.randomBytes(KEY_LENGTH);
  }

  let result;
  if (header.version === "aes128gcm") {
    // Save the DH public key in the header unless keyid is set.
    if (header.privateKey && !header.keyid) {
      header.keyid = header.privateKey.getPublicKey();
    }
    result = writeHeader(header);
  } else {
    // No header on other versions
    result = new Buffer(0);
  }

  const key = deriveKeyAndNonce(header, MODE_ENCRYPT);
  let start = 0;
  const padSize = PAD_SIZE[header.version];
  let overhead = padSize;
  if (header.version === "aes128gcm") {
    overhead += TAG_LENGTH;
  }
  let pad = isNaN(parseInt(params.pad, 10)) ? 0 : parseInt(params.pad, 10);

  let counter = 0;
  let last = false;
  while (!last) {
    // Pad so that at least one data byte is in a block.
    let recordPad = Math.min(header.rs - overhead - 1, pad);
    if (header.version !== "aes128gcm") {
      recordPad = Math.min((1 << (padSize * 8)) - 1, recordPad);
    }
    if (pad > 0 && recordPad === 0) {
      ++recordPad; // Deal with perverse case of rs=overhead+1 with padding.
    }
    pad -= recordPad;

    const end = start + header.rs - overhead - recordPad;
    if (header.version !== "aes128gcm") {
      // The > here ensures that we write out a padding-only block at the end
      // of a buffer.
      last = end > buffer.length;
    } else {
      last = end >= buffer.length;
    }
    last = last && pad <= 0;
    const block = encryptRecord(
      key,
      counter,
      buffer.slice(start, end),
      recordPad,
      header,
      last
    );
    result = Buffer.concat([result, block]);

    start = end;
    ++counter;
  }
  return result;
}

module.exports = {
  decrypt: decrypt,
  encrypt: encrypt,
};

export function encryptContent(
  userPublicKey: string,
  userAuth: string,
  payload: string | Buffer,
  contentEncoding?: string
) {
  if (Buffer.from(userPublicKey, "base64url").length !== 65) {
    throw new Error(
      "The subscription p256dh value should be exactly 65 bytes long."
    );
  }

  if (Buffer.from(userAuth, "base64url").length < 16) {
    throw new Error(
      "The subscription auth key should be at least 16 bytes long"
    );
  }

  if (typeof payload === "string") {
    payload = Buffer.from(payload);
  }

  const localCurve = crypto.createECDH("prime256v1");
  const localPublicKey = localCurve.generateKeys();

  const salt = Buffer.from(crypto.randomBytes(16)).toString("base64url");

  const cipherText = ece.encrypt(payload, {
    version: contentEncoding,
    dh: userPublicKey,
    privateKey: localCurve,
    salt: salt,
    authSecret: userAuth,
  });

  return {
    localPublicKey: localPublicKey,
    salt: salt,
    cipherText: cipherText,
  };
}
