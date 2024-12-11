import { Button, Chip, Typography } from "@mui/joy";
import {
  Edge,
  useEdgesState,
  useNodesState,
  useReactFlow,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { useCallback, useState } from "react";
import toast from "react-hot-toast";
import { GoDownload, GoFoldUp, GoGear, GoMilestone } from "react-icons/go";
import { useRecoilState } from "recoil";
import Nodes from "./components/nodes";
import SettingsModal from "./components/settings-modal";
import { Settings, settingsAtom } from "./store";
import { Document, FlowNode } from "./types";
import render from "./utils/render";

function App() {
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [settings, setSettings] = useRecoilState(settingsAtom);
  const flow = useReactFlow();

  /* Nodes/Edges */
  const [nodes, setNodes, onNodesChange] = useNodesState<FlowNode>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);

  /* Save */
  const [saving, setSaving] = useState(false);

  const handleSaveDialog = useCallback(() => {
    if (saving) return;

    setSaving(true);

    function cancel(reason?: string) {
      setSaving(false);
      if (reason) toast.error(reason);
    }

    if (!settings.name || settings.name === "") {
      return cancel("Nome do diálogo não foi setado.");
    }

    if (settings.interactionEnabled && (!settings.npc || settings.npc === "")) {
      return cancel("A posição do diálogo não foi setada corretamente");
    }

    if (nodes.length === 0 || edges.length === 0) {
      return cancel("O diálogo não possui ações válidas para ser salvo.");
    }

    const renderization = render.renderFlow(nodes, edges);
    if (!renderization) {
      return cancel(
        "Não foi possível encontrar nenhuma ação conectada ao ínicio."
      );
    }

    const document = {
      npc: settings.npc,
      interaction: undefined as Settings["interaction"] | undefined,
      initial: renderization?.initial,
      actions: renderization?.actions,
      results: renderization?.results,
      conditions: renderization?.conditions,
    };

    if (settings.interactionEnabled) {
      document.interaction = settings.interaction;
    }

    const a = window.document.createElement("a");
    const file = new Blob([JSON.stringify(document)], { type: "text/plain" });

    a.href = URL.createObjectURL(file);
    a.download = `${settings.name}.json`;
    a.click();

    toast.success("Arquivo do diálogo foi baixado.");
    setSaving(false);
  }, [settings, edges, nodes, saving]);

  /* Import */
  const [importing, setImporting] = useState(false);

  const handleImportDialog = useCallback(() => {
    if (importing) return;

    setImporting(true);

    function cancel(reason?: string) {
      setImporting(false);
      if (reason) toast.error(reason);
    }

    const input = document.createElement("input");

    input.type = "file";
    input.multiple = false;
    input.accept = ".json";

    input.onchange = async () => {
      const file = [...(input.files || [])][0];
      if (!file) {
        return cancel("Arquivo do diálogo não foi selecionado.");
      }

      const content = await file.text();
      if (!content || content === "") {
        return cancel("Arquivo do diálogo vazio.");
      }

      const data = JSON.parse(content) as Document;
      if (!data || !data.actions || !data.results) {
        return cancel("Arquivo inválido ou corrompido.");
      }

      /* Settings */
      setSettings((state) => ({
        ...state,
        name: file.name.split(".")[0],
        npc: data.npc || "",
      }));

      if (data.interaction) {
        setSettings((state) => ({
          ...state,
          interaction: data.interaction as Settings["interaction"],
          interactionEnabled: true,
        }));
      }

      /* Support to old versions */
      const _old_location = (data as any).location;
      if (_old_location) {
        const interaction = {} as Settings["interaction"];
        interaction.location = { ..._old_location, world: "world" };
        interaction.renderDistance = 15;

        setSettings((state) => ({
          ...state,
          interaction: interaction,
          interactionEnabled: true,
        }));
      }

      /* Nodes, Edges */
      const { nodes, edges } = render.parseFlow(data);

      setNodes(nodes);
      setEdges(edges);
      flow.fitView();

      toast.success(`Diálogo ${file.name.split(".")[0]} foi importado`);
      setImporting(false);
    };

    input.oncancel = () => setImporting(false);
    input.onerror = () => setImporting(false);

    input.click();
  }, [importing, flow, setImporting, setEdges, setNodes, setSettings]);

  /* Reset */
  const handleReset = useCallback(() => {
    setEdges([]);
    setNodes([
      {
        id: "INITIAL",
        type: "initial",
        origin: [0.5, 0.5],
        position: { x: 0, y: 0 },
        draggable: false,
        data: {},
      },
    ]);
  }, [setEdges, setNodes]);

  return (
    <div className="w-full h-full bg-zinc-900 flex flex-col gap-4 p-8">
      <div className="flex gap-4 items-center">
        <Typography level="h1">Criador de Diálogos</Typography>
        <Chip
          color="primary"
          variant="soft"
          size="sm"
          sx={{ height: "fit-content" }}
        >
          v0.1.3
        </Chip>
      </div>

      <div className="flex flex-col gap-2 h-full overflow-y-auto">
        <div className="flex w-full">
          <Typography level="h4">Roteiro do Diálogo</Typography>
          <div className="flex gap-2 !ml-auto !mr-0">
            <Button
              size="sm"
              startDecorator={<GoMilestone />}
              color="neutral"
              onClick={handleReset}
            >
              Resetar
            </Button>
            <Button
              size="sm"
              startDecorator={<GoGear />}
              color="neutral"
              onClick={() => setSettingsOpen(true)}
            >
              Configurações
            </Button>
          </div>
        </div>
        <div className="w-full h-full">
          <Nodes
            nodes={nodes}
            setNodes={setNodes}
            onNodesChange={onNodesChange}
            edges={edges}
            setEdges={setEdges}
            onEdgesChange={onEdgesChange}
          />
        </div>
      </div>

      <div className="flex gap-2 w-full min-h-fit">
        <Button
          onClick={handleSaveDialog}
          loading={saving}
          startDecorator={<GoDownload size={20} />}
          size="lg"
        >
          Baixar arquivo
        </Button>
        <Button
          color="neutral"
          onClick={handleImportDialog}
          loading={importing}
          startDecorator={<GoFoldUp size={20} />}
          size="lg"
        >
          Importar Diálogo
        </Button>
      </div>

      <SettingsModal
        open={settingsOpen}
        onClose={() => setSettingsOpen(false)}
      />
    </div>
  );
}

export default App;
