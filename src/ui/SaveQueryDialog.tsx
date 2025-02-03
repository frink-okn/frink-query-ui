import {
  Modal,
  ModalDialog,
  DialogTitle,
  DialogContent,
  Stack,
  FormControl,
  FormLabel,
  Input,
  Button,
  IconButton,
} from "@mui/joy";
import { useSavedQueriesContext } from "../context/savedQueries";
import { useState } from "react";
import { Close } from "@mui/icons-material";

interface SaveQueryDialogProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  query: string;
  sources: string[];
}

export function SaveQueryDialog({
  open,
  setOpen,
  query,
  sources,
}: SaveQueryDialogProps) {
  const { saveQuery, savedQueries } = useSavedQueriesContext()!;

  const [inputName, setInputName] = useState("");

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setOpen(false);

    const formData = new FormData(event.currentTarget);
    const name = formData.get("name") as string;

    saveQuery(name, query, sources);
  };

  const queryAlreadyExists = savedQueries.some((q) => q.title === inputName);

  return (
    <Modal open={open} onClose={() => setOpen(false)}>
      <ModalDialog sx={{ maxWidth: 400 }}>
        <DialogTitle>Save Query</DialogTitle>
        <DialogContent>Enter a name to save the current query.</DialogContent>
        {queryAlreadyExists && (
          <DialogContent sx={{ color: "var(--p-red-700)" }}>
            A query with this name already exists. Confirm you want to overwrite
            it.
          </DialogContent>
        )}
        <form onSubmit={handleSubmit}>
          <Stack spacing={2}>
            <FormControl>
              <FormLabel>Name</FormLabel>
              <Input
                autoFocus
                required
                name="name"
                value={inputName}
                onChange={(e) => setInputName(e.target.value)}
                endDecorator={
                  <IconButton onClick={() => setInputName("")}>
                    <Close />
                  </IconButton>
                }
              />
            </FormControl>

            {queryAlreadyExists ? (
              <Button type="submit" color="danger">
                Overwrite
              </Button>
            ) : (
              <Button type="submit" disabled={inputName.length === 0}>
                Submit
              </Button>
            )}
          </Stack>
        </form>
      </ModalDialog>
    </Modal>
  );
}
