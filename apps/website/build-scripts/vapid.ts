// @ts-check
import fs from "node:fs";
import forge from "node-forge";
import "./env.mjs";

/**
 * Decodes a base64url encoded string.
 * @param {string} src encoded string
 * @returns {Buffer}
 */
function decode(src: string) {
  return Buffer.from(src, "base64url");
}
const oidAsn = forge.asn1.create(
  forge.asn1.Class.UNIVERSAL,
  forge.asn1.Type.OID,
  false,
  // prime256v1 = iso(1) member-body(2) us(840) ansi-x962(10045) curves(3) prime(1) prime256v1(7)
  forge.asn1.oidToDer("1.2.840.10045.3.1.7").getBytes()
);

const pemEcParams = forge.pem.encode({
  type: "EC PARAMETERS",
  body: forge.asn1.toDer(oidAsn).getBytes(),
});

/**
 * Pads a key buffer with zeros to the given size.
 * @param {Buffer} privateKeyBuffer
 * @param {number} size
 * @returns {Buffer}
 */
export function padKeyBuffer(privateKeyBuffer: Buffer, size: number) {
  if (size < privateKeyBuffer.length) {
    throw new Error("Key buffer is too large");
  }

  const padding = Buffer.alloc(size - privateKeyBuffer.length);
  padding.fill(0);
  return Buffer.concat([padding, privateKeyBuffer]);
}

/**
 * Converts a private and public key to a PEM-encoded EC private key.
 * @param {string} privateKey
 * @param {string} publicKey
 * @returns {string}
 */
export function toPEM(privateKey: string, publicKey: string) {
  const privateKeyBuffer = padKeyBuffer(decode(privateKey), 32);
  const publicKeyBuffer = padKeyBuffer(decode(publicKey), 66);

  const keyAsn = forge.asn1.create(
    forge.asn1.Class.UNIVERSAL,
    forge.asn1.Type.SEQUENCE,
    true,
    [
      forge.asn1.create(
        forge.asn1.Class.UNIVERSAL,
        forge.asn1.Type.INTEGER,
        false,
        "1"
      ),
      forge.asn1.create(
        forge.asn1.Class.UNIVERSAL,
        forge.asn1.Type.OCTETSTRING,
        false,
        privateKeyBuffer.toString("binary")
      ),
      forge.asn1.create(forge.asn1.Class.CONTEXT_SPECIFIC, 0, true, [oidAsn]),
      forge.asn1.create(forge.asn1.Class.CONTEXT_SPECIFIC, 1, true, [
        forge.asn1.create(
          forge.asn1.Class.UNIVERSAL,
          forge.asn1.Type.BITSTRING,
          false,
          publicKeyBuffer.toString("binary")
        ),
      ]),
    ]
  );

  return (
    pemEcParams +
    forge.pem.encode({
      type: "EC PRIVATE KEY",
      body: forge.asn1.toDer(keyAsn).getBytes(),
    })
  );
}

const publicKey = process.env.NEXT_PUBLIC_WEB_PUSH_VAPID_PUBLIC_KEY;
const privateKey = process.env.WEB_PUSH_VAPID_PRIVATE_KEY;
const pem = privateKey && publicKey ? toPEM(privateKey, publicKey) : null;

fs.writeFileSync(".web-push-vapid.json", JSON.stringify(pem, null, 2));
