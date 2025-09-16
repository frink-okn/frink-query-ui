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
                <EditSourceForm
                  key={source.name}
                  customSources={customSources.filter((_, i) => i !== index)}
                  source={source}
                  onChangeSource={(updatedSource) => {
                    setCustomSources((prev) =>
                      prev.map((s, i) =>
                        i === index ? updatedSource : s
                      )
                    );
                    setInlineSourceEdit({
                      value: { name: "", url: "" },
                      indexBeingEdited: -1,
                    });
                  }}
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

            <NewSourceForm
              customSources={customSources}
              setCustomSources={setCustomSources}
            />
          </SourcesEditorContainer>
        </DialogContent>

        <form
          onSubmit={(event: React.FormEvent<HTMLFormElement>) => {
            event.preventDefault();
            setOpen(false);
          }}
        >
          <Button type="submit" fullWidth>
            Save
          </Button>
        </form>
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

interface NewSourceFormProps {
  customSources: CustomSource[];
  setCustomSources: React.Dispatch<React.SetStateAction<CustomSource[]>>;
}
const NewSourceForm = ({
  customSources,
  setCustomSources,
}: NewSourceFormProps) => {
  const [name, setName] = useState("");
  const [url, setUrl] = useState("");

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

    setCustomSources((prev) => [...prev, { name, url }]);
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

interface EditSourceFormProps {
  customSources: CustomSource[];
  source: CustomSource;
  onChangeSource: (updatedSource: CustomSource) => void;
}
const EditSourceForm = ({
  customSources,
  source,
  onChangeSource,
}: EditSourceFormProps) => {
  const [name, setName] = useState(source.name);
  const [url, setUrl] = useState(source.url);

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

    onChangeSource({ name, url });
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

// const Table = styled("table")`
//   width: 100%;
//   border-collapse: collapse;

//   th,
//   td {
//     text-align: left;
//     padding: 0.2rem;
//   }

//   td:first-of-type,
//   td:nth-of-type(2) {
//     padding-right: 2rem;
//   }
// `;

// <Table>
//   <thead>
//     <tr>
//       <th>Name</th>
//       <th>Source</th>
//       <th></th>
//       <th></th>
//     </tr>
//   </thead>
//   <tbody>
//     {customSources.map((source, index) =>
//       inlineSourceEdit.indexBeingEdited !== index ? (
//         <tr key={index}>
//           <td>{source.name}</td>
//           <td>{source.url}</td>
//           <td>
//             <IconButton
//               size="sm"
//               onClick={() => {
//                 setInlineSourceEdit({
//                   value: source,
//                   indexBeingEdited: index,
//                 });
//               }}
//             >
//               <Edit />
//             </IconButton>
//           </td>
//           <td>
//             <IconButton
//               color="danger"
//               size="sm"
//               onClick={() => {
//                 setCustomSources((prev) =>
//                   prev.filter((_, i) => i !== index)
//                 );
//                 if (inlineSourceEdit.indexBeingEdited === index) {
//                   setInlineSourceEdit({
//                     value: { name: "", url: "" },
//                     indexBeingEdited: -1,
//                   });
//                 }
//               }}
//             >
//               <Delete />
//             </IconButton>
//           </td>
//         </tr>
//       ) : (
//         <tr key={index}>
//           <td>
//             <Input
//               placeholder="Name"
//               value={inlineSourceEdit.value.name}
//               onChange={(e) =>
//                 setInlineSourceEdit((prev) => ({
//                   ...prev,
//                   value: {
//                     ...prev.value,
//                     name: e.target.value,
//                   },
//                 }))
//               }
//             />
//           </td>
//           <td>
//             <Input
//               placeholder="Source"
//               value={inlineSourceEdit.value.url}
//               onChange={(e) =>
//                 setInlineSourceEdit((prev) => ({
//                   ...prev,
//                   value: {
//                     ...prev.value,
//                     url: e.target.value,
//                   },
//                 }))
//               }
//             />
//           </td>
//           <td>
//             <IconButton
//               size="sm"
//               onClick={() => {
//                 if (inlineSourceEdit.value.name && inlineSourceEdit.value.url) {
//                   setCustomSources((prev) =>
//                     prev.map((source, i) =>
//                       i === index
//                         ? inlineSourceEdit.value
//                         : source
//                     )
//                   );
//                   setInlineSourceEdit({
//                     value: { name: "", url: "" },
//                     indexBeingEdited: -1,
//                   });
//                 }
//               }}
//             >
//               <Check />
//             </IconButton>
//           </td>
//           <td>{/* unused column */}</td>
//         </tr>
//       )
//     )}
//     <tr>
//       <td>
//         <Input
//           placeholder="Name"
//           value={newSourceEdit.name}
//           onChange={(e) =>
//             setNewSourceEdit((prev) => ({
//               ...prev,
//               name: e.target.value,
//             }))
//           }
//         />
//       </td>
//       <td>
//         <Input
//           placeholder="Source"
//           value={newSourceEdit.url}
//           onChange={(e) =>
//             setNewSourceEdit((prev) => ({
//               ...prev,
//               url: e.target.value,
//             }))
//           }
//         />
//       </td>
//       <td>
//         <IconButton
//           size="sm"
//           onClick={() => {
//             if (newSourceEdit.name && newSourceEdit.url) {
//               setCustomSources((prev) => [...prev, newSourceEdit]);
//               setNewSourceEdit({ name: "", url: "" });
//             }
//           }}
//         >
//           <Check />
//         </IconButton>
//       </td>
//       <td>{/* unused column */}</td>
//     </tr>
//   </tbody>
// </Table>
