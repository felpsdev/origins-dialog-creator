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
import { useCallback, useEffect } from "react";
import { useRecoilState, useResetRecoilState } from "recoil";
import { settingsAtom } from "../store";

interface SettingsModalProps {
  open: boolean;
  onClose: () => void;
}

const SettingsModal = (props: SettingsModalProps) => {
  const { open, onClose } = props;
  const [settings, setSettings] = useRecoilState(settingsAtom);
  const resetSettings = useResetRecoilState(settingsAtom);

  const handleChangeLocation = useCallback(
    (
      identifier: "x" | "y" | "z" | "rotation" | "world",
      value: number | string
    ) => {
      setSettings((state) => ({
        ...state,
        interaction: {
          ...state.interaction,
          location: {
            ...state.interaction.location,
            [identifier]: value,
          },
        },
      }));
    },
    [setSettings]
  );

  useEffect(() => {
    if (!settings.interaction) resetSettings();
  }, [settings, resetSettings]);

  return (
    <Modal open={open} onClose={onClose}>
      <ModalDialog variant="outlined" sx={{ width: "500px" }}>
        <ModalClose />
        <DialogTitle>Configurações</DialogTitle>

        <Divider />

        <DialogContent>
          <div className="flex flex-col gap-4 w-full">
            <FormControl>
              <FormLabel>Nome do diálogo</FormLabel>

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

            <FormControl required disabled={!settings.interactionEnabled}>
              <div className="flex w-full">
                <FormLabel>Posição</FormLabel>
                <Checkbox
                  onChange={(event) =>
                    setSettings((state) => ({
                      ...state,
                      interactionEnabled: event.currentTarget.checked,
                    }))
                  }
                  disabled={false}
                  checked={settings.interactionEnabled}
                  className="ml-auto mr-0.5"
                />
              </div>

              <div className="flex w-full gap-2">
                <Input
                  placeholder="X"
                  type="number"
                  value={settings.interaction.location.x}
                  onChange={(event) =>
                    handleChangeLocation(
                      "x",
                      parseFloat(event.currentTarget.value)
                    )
                  }
                />
                <Input
                  placeholder="Y"
                  type="number"
                  value={settings.interaction.location.y}
                  onChange={(event) =>
                    handleChangeLocation(
                      "y",
                      parseFloat(event.currentTarget.value)
                    )
                  }
                />
                <Input
                  placeholder="Z"
                  type="number"
                  value={settings.interaction.location.z}
                  onChange={(event) =>
                    handleChangeLocation(
                      "z",
                      parseFloat(event.currentTarget.value)
                    )
                  }
                />
                <Input
                  placeholder="Rotação"
                  type="number"
                  value={settings.interaction.location.rotation}
                  onChange={(event) =>
                    handleChangeLocation(
                      "rotation",
                      parseFloat(event.currentTarget.value)
                    )
                  }
                />
              </div>

              <FormHelperText>Posição no mundo do minecraft</FormHelperText>
            </FormControl>

            <div className="flex gap-2 w-full">
              <div className="w-[55%]">
                <FormControl disabled={!settings.interactionEnabled}>
                  <FormLabel>Distancia de Renderização</FormLabel>
                  <Input
                    placeholder="Digite aqui"
                    type="number"
                    value={settings.interaction.renderDistance}
                    onChange={(event) =>
                      setSettings((state) => ({
                        ...state,
                        interaction: {
                          ...state.interaction,
                          renderDistance: parseFloat(event.currentTarget.value),
                        },
                      }))
                    }
                  />
                  <FormHelperText>Renderização da interação</FormHelperText>
                </FormControl>
              </div>

              <div className="w-[45%]">
                <FormControl required disabled={!settings.interactionEnabled}>
                  <FormLabel>Mundo</FormLabel>
                  <Input
                    placeholder="Digite aqui"
                    value={settings.interaction.location.world}
                    onChange={(event) =>
                      handleChangeLocation("world", event.currentTarget.value)
                    }
                  />
                  <FormHelperText>Mundo da da posição</FormHelperText>
                </FormControl>
              </div>
            </div>

            <FormControl required disabled={!settings.interactionEnabled}>
              <FormLabel>Id no NPC</FormLabel>

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
                Npc relacionado ao diálogo e as coordenadas
              </FormHelperText>
            </FormControl>
          </div>
        </DialogContent>
      </ModalDialog>
    </Modal>
  );
};

export default SettingsModal;
