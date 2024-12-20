import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Checkbox,
  DialogContent,
  DialogTitle,
  Divider,
  IconButton,
  Input,
  Modal,
  ModalDialog,
  Option,
  Select,
} from "@mui/joy";
import { useCallback, useEffect } from "react";
import { GoPlus, GoTrash, GoX } from "react-icons/go";
import { useRecoilState, useResetRecoilState } from "recoil";
import { settingsAtom, textureSetAtom } from "../store";
import SettingsField from "./settings-field";

interface SettingsModalProps {
  open: boolean;
  onClose: () => void;
}

const animations = [
  { value: "stand", label: "De Pé" },
  { value: "sit", label: "Sentado" },
];

const SettingsModal = (props: SettingsModalProps) => {
  const { open, onClose } = props;
  const [settings, setSettings] = useRecoilState(settingsAtom);
  const [textureSet, setTextureSet] = useRecoilState(textureSetAtom);
  const resetSettings = useResetRecoilState(settingsAtom);

  /* Location */

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

  /* Texture Set */

  const handleCreateTexture = useCallback(
    () =>
      setTextureSet((state) => [
        ...state,
        state.length === 0
          ? { id: crypto.randomUUID(), name: "default", data: "walking" }
          : { id: crypto.randomUUID(), name: "", data: "" },
      ]),
    [setTextureSet]
  );

  const handleRemoveTexture = useCallback(
    (index: number) =>
      setTextureSet((state) => state.filter((_, i) => i !== index)),
    [setTextureSet]
  );

  const handleModifyTexture = useCallback(
    (index: number, field: string, value: string) =>
      setTextureSet((state) =>
        state.map((row, i) => {
          const object = { ...row };
          if (i === index) {
            object[field as "data" | "name"] = value;
          }

          return object;
        })
      ),
    [setTextureSet]
  );

  useEffect(() => {
    if (!settings.interaction) resetSettings();
  }, [settings, resetSettings]);

  return (
    <Modal open={open} onClose={onClose}>
      <ModalDialog
        variant="outlined"
        sx={{ width: "500px", padding: 0 }}
        slotProps={{
          root: {
            className:
              "!border-2 !border-zinc-700 rounded-md !bg-zinc-800 !gap-0",
          },
        }}
      >
        <DialogTitle
          slotProps={{
            root: {
              className:
                "w-full h-fit px-4 py-3 bg-zinc-900 border-b-2 border-b-zinc-700 rounded-t-md flex items-center",
            },
          }}
        >
          Configurações
          <IconButton onClick={onClose} className="!ml-auto">
            <GoX size={20} />
          </IconButton>
        </DialogTitle>

        <DialogContent
          slotProps={{ root: { className: "!p-0 !py-3 !mt-0 !gap-3" } }}
        >
          <SettingsField
            title="Nome do diálogo"
            description="Nome que será considerado o 'id' do diálogo"
          >
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
          </SettingsField>

          <SettingsField
            title={
              <div className="flex items-center">
                Posição
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
            }
            description="Posição no mundo selecionado do minecraft"
          >
            <div className="flex flex-col gap-2">
              <div className="flex w-full gap-2">
                <Input
                  placeholder="X"
                  type="number"
                  value={settings.interaction.location.x?.toString()}
                  disabled={!settings.interactionEnabled}
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
                  value={settings.interaction.location.y?.toString()}
                  disabled={!settings.interactionEnabled}
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
                  value={settings.interaction.location.z?.toString()}
                  disabled={!settings.interactionEnabled}
                  onChange={(event) =>
                    handleChangeLocation(
                      "z",
                      parseFloat(event.currentTarget.value)
                    )
                  }
                />
              </div>
              <div className="flex gap-2">
                <Input
                  placeholder="Rotação"
                  type="number"
                  value={settings.interaction.location.rotation?.toString()}
                  disabled={!settings.interactionEnabled}
                  onChange={(event) =>
                    handleChangeLocation(
                      "rotation",
                      parseFloat(event.currentTarget.value)
                    )
                  }
                />
                <Input
                  placeholder="Mundo"
                  value={settings.interaction.location.world}
                  disabled={!settings.interactionEnabled}
                  onChange={(event) =>
                    handleChangeLocation("world", event.currentTarget.value)
                  }
                />
              </div>
            </div>
          </SettingsField>

          <Accordion>
            <AccordionSummary
              slotProps={{ button: { className: "!px-3 !py-1" } }}
            >
              Opções do NPC
            </AccordionSummary>
            <AccordionDetails
              slotProps={{
                root: {
                  className: "items-center",
                },
                content: {
                  className: "gap-3",
                },
              }}
            >
              <div className="flex w-full">
                <SettingsField
                  title="Id"
                  description="Id do NPC que será requisitado"
                >
                  <Input
                    placeholder="Digite aqui"
                    value={settings.npc}
                    disabled={!settings.interactionEnabled}
                    size="sm"
                    onChange={(event) =>
                      setSettings((state) => ({
                        ...state,
                        npc: event.currentTarget.value,
                      }))
                    }
                  />
                </SettingsField>

                <Divider orientation="vertical" />

                <SettingsField
                  title="Animação"
                  description="Animação do citizen no mundo"
                >
                  <Select
                    value={settings.npcPosition}
                    onChange={(_, selected) =>
                      setSettings((state) => ({
                        ...state,
                        npcPosition: selected || "sit",
                      }))
                    }
                    placeholder="Selecione"
                    size="sm"
                  >
                    {animations.map((row) => (
                      <Option key={row.value} value={row.value}>
                        {row.label}
                      </Option>
                    ))}
                  </Select>
                </SettingsField>
              </div>

              <SettingsField
                title="Distancia de Renderização"
                description="Renderização da interação"
              >
                <Input
                  placeholder="Digite aqui"
                  type="number"
                  size="sm"
                  value={settings.interaction.renderDistance}
                  disabled={!settings.interactionEnabled}
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
              </SettingsField>

              <SettingsField
                title={
                  <div className="flex items-center">
                    Set de Texturas
                    <GoPlus
                      className="ml-auto mr-0 cursor-pointer"
                      size={20}
                      onClick={handleCreateTexture}
                    />
                  </div>
                }
                description="Crie texturas no diálogo para criar dinâmicas"
              >
                <div className="flex flex-col gap-1 overflow-y-auto max-h-40 pr-2">
                  {textureSet.map((row, i) => (
                    <div
                      key={i}
                      className="flex p-2 rounded-sm bg-zinc-700 items-center gap-2"
                    >
                      <Input
                        size="sm"
                        placeholder="Nome"
                        variant="plain"
                        sx={{ borderRadius: "2px", width: "30%" }}
                        value={row.name}
                        onChange={(evt) =>
                          row.name !== "default" &&
                          handleModifyTexture(
                            i,
                            "name",
                            evt.currentTarget.value
                          )
                        }
                      />

                      <Input
                        size="sm"
                        placeholder="Textura"
                        variant="plain"
                        sx={{ borderRadius: "2px", width: "70%" }}
                        value={row.data}
                        onChange={(evt) =>
                          handleModifyTexture(
                            i,
                            "data",
                            evt.currentTarget.value
                          )
                        }
                      />

                      {row.name !== "default" && (
                        <IconButton
                          size="sm"
                          color="danger"
                          onClick={() => handleRemoveTexture(i)}
                        >
                          <GoTrash />
                        </IconButton>
                      )}
                    </div>
                  ))}
                </div>
              </SettingsField>
            </AccordionDetails>
          </Accordion>
        </DialogContent>
      </ModalDialog>
    </Modal>
  );
};

export default SettingsModal;
