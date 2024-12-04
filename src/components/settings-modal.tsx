import {
  Checkbox,
  DialogContent,
  DialogTitle,
  Divider,
  FormControl,
  FormHelperText,
  FormLabel,
  Input,
  Modal,
  ModalClose,
  ModalDialog,
} from "@mui/joy";
import { useCallback } from "react";
import { useRecoilState } from "recoil";
import { settingsAtom } from "../store";

interface SettingsModalProps {
  open: boolean;
  onClose: () => void;
}

const SettingsModal = (props: SettingsModalProps) => {
  const { open, onClose } = props;
  const [settings, setSettings] = useRecoilState(settingsAtom);

  const handleChangeCoord = useCallback(
    (coord: "x" | "y" | "z", value: number) => {
      setSettings((state) => ({
        ...state,
        location: {
          ...state.location,
          [coord]: value,
        },
      }));
    },
    [setSettings]
  );

  return (
    <Modal open={open} onClose={onClose}>
      <ModalDialog variant="outlined" sx={{ width: "500px" }}>
        <ModalClose />
        <DialogTitle>Configurações</DialogTitle>

        <Divider />

        <DialogContent>
          <div className="flex flex-col gap-4">
            <FormControl>
              <FormLabel>Nome do dialogo</FormLabel>

              <Input
                placeholder="Digite aqui"
                value={settings.name}
                onChange={(event) =>
                  setSettings((state) => ({
                    ...state,
                    name: event.currentTarget.value,
                  }))
                }
              />

              <FormHelperText>
                Nome que sera considerado o "id" do dialogo
              </FormHelperText>
            </FormControl>

            <FormControl>
              <div className="flex w-full">
                <FormLabel>Posição</FormLabel>
                <Checkbox
                  onChange={(event) =>
                    setSettings((state) => ({
                      ...state,
                      locationEnabled: event.currentTarget.checked,
                    }))
                  }
                  checked={settings.locationEnabled}
                  className="ml-auto mr-0.5"
                />
              </div>

              <div className="flex w-full gap-2">
                <Input
                  placeholder="X"
                  type="number"
                  disabled={!settings.locationEnabled}
                  value={settings.location.x}
                  onChange={(event) =>
                    handleChangeCoord(
                      "x",
                      parseFloat(event.currentTarget.value)
                    )
                  }
                />
                <Input
                  placeholder="Y"
                  type="number"
                  disabled={!settings.locationEnabled}
                  value={settings.location.y}
                  onChange={(event) =>
                    handleChangeCoord(
                      "y",
                      parseFloat(event.currentTarget.value)
                    )
                  }
                />
                <Input
                  placeholder="Z"
                  type="number"
                  disabled={!settings.locationEnabled}
                  value={settings.location.z}
                  onChange={(event) =>
                    handleChangeCoord(
                      "z",
                      parseFloat(event.currentTarget.value)
                    )
                  }
                />
              </div>

              <FormHelperText>
                Posição X,Y,Z no mundo do minecraft
              </FormHelperText>
            </FormControl>

            <FormControl disabled={!settings.locationEnabled}>
              <FormLabel>Id no npc</FormLabel>

              <Input
                placeholder="Digite aqui"
                value={settings.npc}
                onChange={(event) =>
                  setSettings((state) => ({
                    ...state,
                    npc: event.currentTarget.value,
                  }))
                }
              />

              <FormHelperText>
                Npc relacionado ao dialogo e as coordenadas
              </FormHelperText>
            </FormControl>
          </div>
        </DialogContent>
      </ModalDialog>
    </Modal>
  );
};

export default SettingsModal;
