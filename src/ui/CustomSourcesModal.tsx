import { Check, Delete, Edit } from "@mui/icons-material";
import {
  Button,
  DialogContent,
  DialogTitle,
  FormControl,
  FormHelperText,
  IconButton,
  Input,
  Modal,
  ModalDialog as MuiModalDialog,
  styled,
} from "@mui/material";
import { Fragment, useId, useState } from "react";
import { isUrl } from "../utils";

export type CustomSource = {
  name: string;
  url: string;
};

interface CustomSourcesModalProps {
  customSources: CustomSource[];
  setCustomSources: React.Dispatch<React.SetStateAction<CustomSource[]>>;
  open: boolean;
  setOpen: (open: boolean) => void;
}

export const CustomSourcesModal = ({
  open,
  setOpen,
  customSources,
  setCustomSources,
}: CustomSourcesModalProps) => {
  const [inlineSourceEdit, setInlineSourceEdit] = useState<{
    value: CustomSource;
    indexBeingEdited: number;
  }>({
    value: { name: "", url: "" },
    indexBeingEdited: -1,
  });

  const handleDeleteRow = (index: number) => {
    setCustomSources((prev) => prev.filter((_, i) => i !== index));
  };

  const handleEditRow = (index: number) => {
    setInlineSourceEdit({
      value: customSources[index],
      indexBeingEdited: index,
    });
  };

  const handleInlineSourceEditComplete = (
    updatedSource: CustomSource,
    index: number
  ) => {
    setCustomSources((prev) =>
      prev.map((s, i) => (i === index ? updatedSource : s))
    );
    setInlineSourceEdit({
      value: { name: "", url: "" },
      indexBeingEdited: -1,
    });
  };

  return (
    <Modal open={open} onClose={() => setOpen(false)}>
      <ModalDialog>
        <DialogTitle>Edit Custom Sources</DialogTitle>

        <HorizontalRule />

        <DialogContent>
          <SourcesEditorContainer>
            <SourceEditorHeader />

            {customSources.map((source, index) =>
              inlineSourceEdit.indexBeingEdited === index ? (
                <SourceForm
                  key={source.name}
                  customSources={customSources.filter((_, i) => i !== index)}
                  source={source}
                  onChangeSource={(updatedSource) =>
                    handleInlineSourceEditComplete(updatedSource, index)
                  }
                />
              ) : (
                <SourceRow
                  key={source.name}
                  source={source}
                  onEdit={() => handleEditRow(index)}
                  onDelete={() => handleDeleteRow(index)}
                />
              )
            )}

            <SourceForm
              customSources={customSources}
              setCustomSources={setCustomSources}
            />
          </SourcesEditorContainer>
        </DialogContent>

        <Button fullWidth onClick={() => setOpen(false)}>
          Close
        </Button>
      </ModalDialog>
    </Modal>
  );
};

const SourceEditorHeader = () => (
  <>
    <strong>Name</strong>
    <strong>URL</strong>
    <div />
    <div /> {/* empty elements to fill grid cell */}
  </>
);

interface SourceRowProps {
  source: CustomSource;
  onEdit: () => void;
  onDelete: () => void;
}
const SourceRow = ({ source, onEdit, onDelete }: SourceRowProps) => (
  <Fragment key={source.name}>
    <span style={{ alignSelf: "center" }}>{source.name}</span>
    <span style={{ alignSelf: "center" }}>{source.url}</span>
    <IconButton size="sm" onClick={onEdit}>
      <Edit />
    </IconButton>
    <IconButton size="sm" color="danger" onClick={onDelete}>
      <Delete />
    </IconButton>
  </Fragment>
);

interface SourceFormProps {
  /**
   * This prop is always provided for validation that the proposed name isn't in use already.
   */
  customSources: CustomSource[];
  /**
   * If provided, we're adding a new source
   */
  setCustomSources?: React.Dispatch<React.SetStateAction<CustomSource[]>>;
  /**
   * If provided, we're editing an existing source
   */
  source?: CustomSource;
  /**
   * If provided, we're editing an existing source (will always need this prop if `source` is provided)
   */
  onChangeSource?: (updatedSource: CustomSource) => void;
}
const SourceForm = ({
  customSources,
  setCustomSources,
  source,
  onChangeSource,
}: SourceFormProps) => {
  const [name, setName] = useState(source?.name ?? "");
  const [url, setUrl] = useState(source?.url ?? "");

  const [nameError, setNameError] = useState<string | null>(null);
  const [urlError, setUrlError] = useState<string | null>(null);

  const formId = `source-form-${useId()}`;

  const handleChangeName = (e: React.ChangeEvent<HTMLInputElement>) => {
    setName(e.target.value);
    setNameError(null);
  };

  const handleChangeUrl = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUrl(e.target.value);
    setUrlError(null);
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const name = formData.get("name")!.toString().trim();
    const url = formData.get("url")!.toString().trim();

    let _nameError: string | null = null;
    let _urlError: string | null = null;

    if (name.length === 0) _nameError = "Name is required";
    if (customSources.find((s) => s.name === name))
      _nameError = "This name already exists";
    if (!isUrl(url)) _urlError = "Enter a valid URL";
    if (url.length === 0) _urlError = "URL is required";

    setNameError(_nameError);
    setUrlError(_urlError);

    if (_nameError || _urlError) return;

    if (source) {
      if (!onChangeSource)
        throw new Error("`onChangeSource` is required if `source` is provided");
      onChangeSource({ name, url });
    } else if (setCustomSources) {
      setCustomSources((prev) => [...prev, { name, url }]);
    } else {
      throw new Error(
        "`setCustomSources` is required if `source` is not provided"
      );
    }

    setName("");
    setUrl("");
    setNameError(null);
    setUrlError(null);
  };

  return (
    <>
      <form style={{ display: "none" }} onSubmit={handleSubmit} id={formId} />
      <FormControl required error={Boolean(nameError)}>
        <Input
          name="name"
          slotProps={{ input: { form: formId } }}
          value={name}
          onChange={handleChangeName}
          placeholder="Name"
        />
        {Boolean(nameError) && (
          <FormHelperText sx={{ pl: "12px" }}>{nameError}</FormHelperText>
        )}
      </FormControl>
      <FormControl required error={Boolean(urlError)}>
        <Input
          name="url"
          slotProps={{ input: { form: formId } }}
          value={url}
          onChange={handleChangeUrl}
          placeholder="URL"
        />
        {Boolean(urlError) && (
          <FormHelperText sx={{ pl: "12px" }}>{urlError}</FormHelperText>
        )}
      </FormControl>
      <IconButton
        form={formId}
        type="submit"
        size="sm"
        variant="soft"
        disabled={name.length === 0 || url.length === 0}
      >
        <Check />
      </IconButton>
      <div></div> {/* empty element to fill grid cell */}
    </>
  );
};

const HorizontalRule = styled("hr")`
  width: 100%;
  margin: 0.25rem 0;
`;

const ModalDialog = styled(MuiModalDialog)`
  width: minmax(600px, fit-content);
  height: 500px;
  max-width: calc(100% - 1rem);
  max-height: calc(100% - 1rem);
`;

const SourcesEditorContainer = styled("div")`
  display: grid;
  gap: 0.5rem;
  grid-template-columns: 1fr 1fr 32px 32px;
  align-items: start;
`;
