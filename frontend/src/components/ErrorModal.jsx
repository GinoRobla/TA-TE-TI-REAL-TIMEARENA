import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Typography } from "@mui/material";

export default function ErrorModal({ message, onClose }) {
  return (
    <Dialog open={!!message} onClose={onClose}>
      <DialogTitle sx={{ color: "#b71c1c", fontWeight: 700 }}>
        Error
      </DialogTitle>
      <DialogContent>
        <Typography>{message}</Typography>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} variant="contained" sx={{ background: "#b71c1c" }}>
          Cerrar
        </Button>
      </DialogActions>
    </Dialog>
  );
}
