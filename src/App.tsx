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
import { GoDownload, GoFoldUp, GoGear } from "react-icons/go";
import { useRecoilState } from "recoil";
import Nodes from "./components/nodes";
import SettingsModal from "./components/settings-modal";
import { Settings, settingsAtom } from "./store";
import { ActionNode, Document, ResultNode } from "./types";
import render from "./utils/render";

function App() {
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [settings, setSettings] = useRecoilState(settingsAtom);
  const flow = useReactFlow();

  /* Nodes/Edges */
  const [nodes, setNodes, onNodesChange] = useNodesState<
    ActionNode | ResultNode
  >([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);

  /* Actions */
  const [loading, setLoading] = useState(false);

  const handleSaveFile = useCallback(() => {
    if (loading) return;

    if (!settings.name || settings.name === "") {
      toast.error("Nome do diálogo não foi setado.");
      return;
    }

    if (nodes.length === 0 || edges.length === 0) {
      toast.error("O diálogo não possui ações válidas para ser salvo.");
      return;
    }

    setLoading(true);

    try {
      const response = render.renderFlow(nodes, edges);
      const document = {
        ...response,
        creator_data: {
          nodes: nodes.map((nd) => ({
            id: nd.id,
            type: nd.type,
            position: nd.position,
            data: nd.data,
          })),
          edges,
        },
      } as Document;

      if (!document) {
        setLoading(false);
        return toast.error("Não foi possível renderizar a arvóre do diálogo.");
      }

      if (settings.locationEnabled) {
        document.location = settings.location;
        if (settings.npc) document.npc = settings.npc;
      }

      const a = window.document.createElement("a");
      const file = new Blob([JSON.stringify(document)], { type: "text/plain" });

      a.href = URL.createObjectURL(file);
      a.download = `${settings.name}.json`;
      a.click();

      toast.success("Arquivo do diálogo foi baixado.");
    } catch (error: any) {
      toast.error("Algum erro ocorreu na renderização do diálogo", error);
    }

    setLoading(false);
  }, [settings, nodes, edges, loading]);

  const handleImportFile = useCallback(() => {
    if (loading) return;

    setLoading(true);

    const input = document.createElement("input");

    input.type = "file";
    input.multiple = false;
    input.accept = ".json";

    input.onchange = async () => {
      const file = [...(input.files || [])][0];
      if (!file) {
        setLoading(false);
        toast.error("Arquivo do diálogo não foi selecionado.");
        return;
      }

      const content = await file.text();
      if (!content || content === "") {
        setLoading(false);
        toast.error("Arquivo do diálogo vazio.");
        return;
      }

      const data = JSON.parse(content) as Document;
      if (!data) {
        setLoading(false);
        toast.error("Arquivo inválido ou corrompido.");
        return;
      }

      if (
        !data.creator_data ||
        !data.creator_data.nodes ||
        !data.creator_data.edges
      ) {
        setLoading(false);
        toast.error("Arquivo não suportado para importação");
        return;
      }

      /* Settings */
      setSettings((state) => ({ ...state, name: file.name.split(".")[0] }));

      if (data.npc) {
        setSettings((state) => ({ ...state, npc: data.npc }));
      }

      if (data.location) {
        setSettings((state) => ({
          ...state,
          location: data.location as Settings["location"],
          locationEnabled: true,
        }));
      } else {
        setSettings((state) => ({ ...state, locationEnabled: false }));
      }

      /* Nodes, Edges */
      const { nodes, edges } = data.creator_data;

      setNodes(nodes.map((nd) => ({ ...nd, origin: [0.5, 0.5] })));
      setEdges(edges);
      flow.fitView();

      toast.success(`Diálogo ${file.name.split(".")[0]} foi importado`);
      setLoading(false);
    };

    input.oncancel = () => setLoading(false);
    input.onerror = () => setLoading(false);

    input.click();
  }, [loading, setSettings, setNodes, setEdges]);

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
          v0.1.0
        </Chip>
      </div>

      <div className="flex flex-col gap-2 h-full overflow-y-auto">
        <div className="flex w-full">
          <Typography level="h4">Roteiro do Diálogo</Typography>
          <Button
            size="sm"
            startDecorator={<GoGear />}
            color="neutral"
            onClick={() => setSettingsOpen(true)}
            className="!ml-auto !mr-0"
          >
            Configurações
          </Button>
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
          onClick={handleSaveFile}
          loading={loading}
          startDecorator={<GoDownload size={20} />}
          size="lg"
        >
          Baixar arquivo
        </Button>
        <Button
          onClick={handleImportFile}
          color="neutral"
          loading={loading}
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
