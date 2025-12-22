import { createId } from "@paralleldrive/cuid2";
import { useRouter } from "next/router";
import { type FormEvent, useCallback, useMemo, useState } from "react";

import ambassadors from "@alveusgg/data/build/ambassadors/core";
import {
  type ActiveAmbassadorKey,
  isActiveAmbassadorEntry,
  isActiveAmbassadorKey,
} from "@alveusgg/data/build/ambassadors/filters";

import { type ImageMimeType, imageMimeTypes } from "@/utils/files";
import { typeSafeObjectEntries } from "@/utils/helpers";
import { createImageUrl } from "@/utils/image";
import { extractColorFromImage } from "@/utils/process-image";
import { SLUG_PATTERN, convertToSlug } from "@/utils/slugs";
import { type RouterInputs, type RouterOutputs, trpc } from "@/utils/trpc";

import useFileUpload from "@/hooks/files/upload";

import { MessageBox } from "@/components/shared/MessageBox";
import { Button, defaultButtonClasses } from "@/components/shared/form/Button";
import { Fieldset } from "@/components/shared/form/Fieldset";
import { ImageUploadAttachment } from "@/components/shared/form/ImageUploadAttachment";
import { SelectBoxField } from "@/components/shared/form/SelectBoxField";
import { TextField } from "@/components/shared/form/TextField";
import {
  UploadAttachmentsField,
  useUploadAttachmentsData,
} from "@/components/shared/form/UploadAttachmentsField";

import IconTrash from "@/icons/IconTrash";

const resizeImageOptions = {
  maxWidth: 512,
  maxHeight: 512,
  quality: 90,
};

type RoundsCheckSchema = RouterInputs["adminRoundsChecks"]["createRoundsCheck"];
type RoundsCheck = RouterOutputs["adminRoundsChecks"]["getRoundsCheck"];

type RoundsCheckFormProps = {
  action: "create" | "edit";
  check?: RoundsCheck;
};

export function RoundsCheckForm({ action, check }: RoundsCheckFormProps) {
  const router = useRouter();
  const create = trpc.adminRoundsChecks.createRoundsCheck.useMutation();
  const edit = trpc.adminRoundsChecks.editRoundsCheck.useMutation();
  const createFileUpload =
    trpc.adminRoundsChecks.createFileUpload.useMutation();

  const [error, setError] = useState<string | null>(null);

  const upload = useFileUpload<ImageMimeType>(
    (signature) => createFileUpload.mutateAsync(signature),
    { allowedFileTypes: imageMimeTypes },
  );

  const imageAttachmentData = useUploadAttachmentsData(
    useMemo(() => {
      const { fileStorageObjectId, fileStorageObjectUrl } = check || {};
      if (!fileStorageObjectId || !fileStorageObjectUrl) {
        return [];
      }

      return [
        {
          status: "saved",
          id: createId(),
          url: fileStorageObjectUrl.toString(),
          fileStorageObjectId: fileStorageObjectId,
          extractColor: async () =>
            await extractColorFromImage(
              createImageUrl({
                src: fileStorageObjectUrl.toString(),
                width: 512,
                quality: 100,
              }),
            ),
        },
      ];
    }, [check]),
  );
  const imageFile = imageAttachmentData.files[0];

  const [name, setName] = useState(check?.name || "");
  const [imageType, setImageType] = useState<ActiveAmbassadorKey | "custom">(
    check?.ambassador && isActiveAmbassadorKey(check.ambassador)
      ? check.ambassador
      : "custom",
  );

  const handleSubmit = useCallback(
    (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      setError(null);

      const formData = new FormData(event.currentTarget);

      const imageData =
        imageType === "custom"
          ? {
              ambassador: null,
              fileStorageObjectId:
                imageFile?.status === "upload.done" ||
                imageFile?.status === "saved"
                  ? imageFile.fileStorageObjectId
                  : "",
            }
          : {
              ambassador: imageType,
              fileStorageObjectId: null,
            };
      if (!imageData.ambassador && !imageData.fileStorageObjectId) {
        setError("Please select an ambassador or upload a custom image.");
        return;
      }

      const mutationData: RoundsCheckSchema = {
        name: String(formData.get("name")),
        command: convertToSlug(String(formData.get("name"))),
        hidden: check?.hidden ?? false,
        ...imageData,
      };

      const command =
        formData.has("command") && String(formData.get("command"));
      if (command) {
        mutationData.command = command;
      }

      if (action === "edit") {
        if (!check) return;
        edit.mutate({
          id: check.id,
          ...mutationData,
        });
      } else {
        create.mutate(mutationData, {
          onSuccess: async () => {
            await router.push("/admin/rounds-checks");
          },
        });
      }
    },
    [imageType, imageFile, action, check, router, create, edit],
  );

  return (
    <form className="flex flex-col gap-10" onSubmit={handleSubmit}>
      {(create.error || edit.error) && (
        <MessageBox variant="failure">
          <pre>{(create.error || edit.error)?.message}</pre>
        </MessageBox>
      )}
      {error && <MessageBox variant="failure">{error}</MessageBox>}
      {edit.isSuccess && (
        <MessageBox variant="success">Rounds check updated!</MessageBox>
      )}

      <Fieldset legend="Rounds check">
        <TextField
          label="Name"
          name="name"
          value={name}
          onChange={setName}
          isRequired
        />

        <TextField
          label="Command (alphanumeric, dashes allowed)"
          name="command"
          defaultValue={check?.command || ""}
          pattern={SLUG_PATTERN}
          inputClassName="font-mono"
          placeholder={convertToSlug(name)}
          prefix={
            <div className="cursor-default pl-2 font-mono select-none">
              !check
            </div>
          }
        />

        <SelectBoxField
          label="Image"
          name="image"
          required
          value={imageType}
          onChange={(event) =>
            setImageType(event.target.value as ActiveAmbassadorKey | "custom")
          }
        >
          <optgroup>
            <option value="custom">Custom upload</option>
          </optgroup>
          <optgroup>
            {typeSafeObjectEntries(ambassadors)
              .filter(isActiveAmbassadorEntry)
              .map(([key, { name }]) => (
                <option key={key} value={key}>
                  {name}
                </option>
              ))}
          </optgroup>
        </SelectBoxField>

        {imageType === "custom" && (
          <UploadAttachmentsField
            label=""
            {...imageAttachmentData}
            maxNumber={1}
            multiple={false}
            upload={upload}
            allowedFileTypes={imageMimeTypes}
            resizeImageOptions={resizeImageOptions}
            renderAttachment={(props) => (
              <ImageUploadAttachment {...props}>
                <div className="flex h-full flex-col items-start justify-center">
                  <Button
                    size="small"
                    width="auto"
                    onClick={() =>
                      imageAttachmentData.dispatch({
                        type: "remove",
                        id: props.fileReference.id,
                      })
                    }
                  >
                    <IconTrash className="size-5" />
                    Remove
                  </Button>
                </div>
              </ImageUploadAttachment>
            )}
          />
        )}
      </Fieldset>

      <Button type="submit" className={defaultButtonClasses}>
        {action === "create" ? "Create" : "Update"}
      </Button>
    </form>
  );
}
