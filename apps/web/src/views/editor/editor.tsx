import { BubbleMenu, LinkPreviewMenu, FloatingMenu, BubbleMenuMode } from "./menus";
import {
  BubbleMenuWrapper,
  FloatingMenuWrapper,
  SolidEditor,
  SolidEditorContent,
  useEditor
} from "@vrite/tiptap-solid";
import {
  ParentComponent,
  Show,
  createEffect,
  createMemo,
  createSignal,
  on,
  onCleanup
} from "solid-js";
import { HardBreak, Paragraph, Text, Document, UniqueId } from "@vrite/editor";
import {
  Extension,
  isTextSelection,
  Node as NodeExtension,
  Mark as MarkExtension,
  Content,
  Extensions
} from "@tiptap/core";
import { Gapcursor } from "@tiptap/extension-gapcursor";
import { Dropcursor } from "@tiptap/extension-dropcursor";
import { Typography } from "@tiptap/extension-typography";
import { HocuspocusProvider, WebSocketStatus } from "@hocuspocus/provider";
import { CharacterCount } from "@tiptap/extension-character-count";
import * as Y from "yjs";
import { useLocation, useNavigate } from "@solidjs/router";
import { CellSelection } from "@tiptap/pm/tables";
import { AllSelection, NodeSelection } from "@tiptap/pm/state";
import clsx from "clsx";
import { Instance } from "tippy.js";
import { debounce } from "@solid-primitives/scheduled";
import { Dropdown } from "#components/primitives";
import {
  Placeholder,
  DraggableText,
  LinkPreviewWrapper,
  SlashMenuPlugin,
  BlockActionMenuPlugin,
  CollabCursor,
  Collab,
  createClipboardSerializer,
  createExtensions,
  createBlockMenuOptions,
  BlockPaste,
  TableMenuPlugin,
  CommentMenuPlugin,
  ElementMenuPlugin,
  AutoDir,
  Shortcuts,
  createSnippetsMenuOptions
} from "#lib/editor";
import { useAuthenticatedUserData, useExtensions, useHostConfig, useSharedState } from "#context";
import { breakpoints, createRef } from "#lib/utils";
import { BlockMenu } from "#lib/editor/extensions/slash-menu/component";
import { useCommentData } from "#context/comments";
import { TrailingNode } from "#lib/editor/extensions/trailing-node";

declare module "#context" {
  interface SharedState {
    editor?: SolidEditor;
    provider?: HocuspocusProvider;
  }
}

interface EditorProps {
  reloaded?: boolean;
  extensions?: Extensions;
  scrollableContainerRef(): HTMLElement | null;
  onLoad?(): void;
  reload?(): void;
}

const Editor: ParentComponent<
  EditorProps & { docName?: string; content?: Content; editable?: boolean }
> = (props) => {
  const hostConfig = useHostConfig();
  const navigate = useNavigate();
  const location = useLocation();
  const commentData = useCommentData();
  const { useSharedSignal } = useSharedState();
  const { workspaceSettings } = useAuthenticatedUserData();
  const extensionsContext = useExtensions();
  const [, setSharedEditor] = useSharedSignal("editor");
  const [, setSharedProvider] = useSharedSignal("provider");
  const [containerRef, setContainerRef] = createRef<HTMLElement | null>(null);
  const [bubbleMenuOpened, setBubbleMenuOpened] = createSignal(true);
  const [bubbleMenuInstance, setBubbleMenuInstance] = createSignal<Instance | null>(null);
  const [floatingMenuOpened, setFloatingMenuOpened] = createSignal(true);
  const [blockMenuOpened, setBlockMenuOpened] = createSignal(false);
  const [forceBubbleMenu, setForceBubbleMenu] = createSignal<BubbleMenuMode | undefined>();
  const [isNodeSelection, setIsNodeSelection] = createSignal(false);
  const [activeElement, setActiveElement] = createRef<HTMLElement | null>(null);
  const baseBlockMenuOptions = createMemo(() => {
    return workspaceSettings() ? createBlockMenuOptions(workspaceSettings()!) : [];
  });
  const blockMenuOptions = createMemo(() => {
    return [...baseBlockMenuOptions(), ...createSnippetsMenuOptions()];
  });
  const updateBubbleMenuPlacement = debounce(() => {
    bubbleMenuInstance()?.setProps({ placement: isNodeSelection() ? "top-start" : "top" });
  }, 250);
  const handleReload = async (): Promise<void> => {
    if (props.reloaded) {
      navigate("/");
    } else {
      await fetch("/session/refresh", { method: "POST" });
      props.reload?.();
    }
  };
  const scrollToHeading = (): void => {
    const slug = location.hash.replace("#", "");
    const scrollableContainer = props.scrollableContainerRef();

    if (!slug || !scrollableContainer) return;

    const heading = containerRef()?.querySelector(`[data-slug="${slug}"]`);

    if (!heading) return;

    const containerRect = scrollableContainer.getBoundingClientRect();
    const rect = heading.getBoundingClientRect();

    requestAnimationFrame(() => {
      scrollableContainer.scrollTo({
        top: rect.top - containerRect.top + scrollableContainer.scrollTop,
        behavior: "instant"
      });
      navigate(location.pathname, { replace: true });
    });
  };
  const shouldShow = (editor: SolidEditor): boolean => {
    const { state, view } = editor;
    const { doc, selection } = state;
    const { ranges } = selection;
    const from = Math.min(...ranges.map((range) => range.$from.pos));
    const to = Math.max(...ranges.map((range) => range.$to.pos));
    const { empty } = selection;
    const isAllSelection = selection instanceof AllSelection;
    const isCellSelection = selection instanceof CellSelection;
    const isNodeSelection = selection instanceof NodeSelection;
    const isEmptyTextBlock = !doc.textBetween(from, to).length && isTextSelection(state.selection);

    setActiveElement(null);

    if ((!view.hasFocus() && !isNodeSelection) || isAllSelection) {
      setBubbleMenuOpened(false);

      return false;
    }

    if (isCellSelection) {
      setBubbleMenuOpened(true);

      return true;
    }

    if (
      isNodeSelection &&
      ["horizontalRule", "image", "codeBlock", "embed", "element", "blockquote"].some((name) => {
        return editor.isActive(name);
      })
    ) {
      setBubbleMenuOpened(false);

      return false;
    }

    if (empty || isEmptyTextBlock) {
      setBubbleMenuOpened(false);

      return false;
    }

    setBubbleMenuOpened(true);

    return true;
  };
  const shouldShowFloatingMenu = (editor: SolidEditor): boolean => {
    const { state, view } = editor;
    const { selection } = state;
    const { $anchor, empty } = selection;
    const isRootDepth = $anchor.depth === 1;
    const isEmptyTextBlock =
      $anchor.parent.isTextblock &&
      !$anchor.parent.type.spec.code &&
      $anchor.parent.type.name === "paragraph" &&
      !$anchor.parent.textContent;

    if (!view.hasFocus() || !empty || !isRootDepth || !isEmptyTextBlock || !editor.isEditable) {
      setFloatingMenuOpened(false);

      return false;
    }

    setFloatingMenuOpened(true);

    return true;
  };
  const getEditorExtensions = (
    provider?: HocuspocusProvider | null
  ): Array<MarkExtension | NodeExtension> => {
    if (workspaceSettings()) {
      return createExtensions(extensionsContext, workspaceSettings()!, provider);
    }

    return [];
  };
  const ydoc = new Y.Doc();
  const provider =
    (props.docName &&
      new HocuspocusProvider({
        token: "vrite",
        url: window.env.PUBLIC_COLLAB_URL.replace("http", "ws"),
        async onSynced() {
          props.onLoad?.();
          scrollToHeading();
        },
        onDisconnect: handleReload,
        onAuthenticationFailed: handleReload,
        onClose: handleReload,
        onStatus({ status }) {
          if (status === WebSocketStatus.Disconnected) {
            handleReload();
          }
        },
        name: props.docName,
        document: ydoc
      })) ||
    null;
  const editor = useEditor({
    onCreate({ editor }) {
      editor.view.setProps({
        clipboardSerializer: createClipboardSerializer(editor, workspaceSettings()!)
      });

      if (!provider) {
        props.onLoad?.();
      }
    },
    onSelectionUpdate({ editor }) {
      setIsNodeSelection(editor.state.selection instanceof NodeSelection);
    },
    onBlur({ event }) {
      setActiveElement(event?.relatedTarget as HTMLElement | null);
    },
    extensions: [
      Shortcuts,
      ...getEditorExtensions(provider),
      Document,
      Paragraph,
      Text,
      HardBreak,
      Typography,
      CharacterCount,
      AutoDir,
      Gapcursor,
      Dropcursor.configure({ class: "ProseMirror-dropcursor" }),
      TrailingNode,
      UniqueId,
      ...((provider && [
        Collab.configure({
          document: ydoc
        }),
        CollabCursor(provider)
      ]) ||
        []),
      ...((props.editable && [
        BlockPaste.configure({ workspaceSettings }),
        Placeholder,
        DraggableText,
        SlashMenuPlugin.configure({
          menuItems: blockMenuOptions
        }),
        hostConfig.extensions && BlockActionMenuPlugin,
        TableMenuPlugin,
        ElementMenuPlugin,
        CommentMenuPlugin.configure({
          commentData
        })
      ]) ||
        []),
      ...(props.extensions || [])
    ].filter(Boolean) as Extensions,
    editable: props.editable,
    editorProps: { attributes: { class: `outline-none` } },
    ...(props.content && { content: props.content })
  });

  onCleanup(() => {
    editor().destroy();
    provider?.destroy();
    setSharedEditor(undefined);
    setSharedProvider(undefined);
  });
  createEffect(
    on(
      () => location.hash,
      () => {
        scrollToHeading();
      }
    )
  );
  createEffect(
    on(editor, () => {
      setSharedEditor(editor());
      if (provider) setSharedProvider(provider);
    })
  );
  createEffect(
    on(isNodeSelection, () => {
      updateBubbleMenuPlacement();
    })
  );

  return (
    <div
      class="w-full max-w-[70ch] prose prose-editor text-xl dark:prose-invert relative transform"
      ref={setContainerRef}
      id="pm-container"
    >
      <Show when={props.editable}>
        <LinkPreviewWrapper editor={editor()}>
          {(link, tippyInstance) => {
            return (
              <LinkPreviewMenu
                link={link}
                editor={editor()}
                tippyInstance={tippyInstance}
                setBubbleMenu={setForceBubbleMenu}
              />
            );
          }}
        </LinkPreviewWrapper>

        <BubbleMenuWrapper
          editor={editor()}
          tippyOptions={{
            duration: [300, 250],
            zIndex: 30,
            hideOnClick: false,
            interactive: true,
            animation: breakpoints.md() ? "scale-subtle" : "shift-away-subtle",
            onHide() {
              if (containerRef()?.contains(activeElement())) return false;
            },
            onCreate(instance) {
              setBubbleMenuInstance(instance);
            },
            maxWidth: "100%"
          }}
          shouldShow={({ editor }) => {
            if (!breakpoints.md() && shouldShowFloatingMenu(editor as SolidEditor)) {
              setForceBubbleMenu("block");

              return true;
            }

            setForceBubbleMenu(undefined);

            if (isNodeSelection()) {
              bubbleMenuInstance()?.setProps({
                placement: isNodeSelection() ? "top-start" : "top"
              });
            }

            return shouldShow(editor as SolidEditor);
          }}
        >
          <BubbleMenu
            class={clsx(!breakpoints.md() && "m-0 w-screen -left-1 rounded-none border-x-0")}
            editor={editor()}
            opened={bubbleMenuOpened()}
            setBlockMenuOpened={setBlockMenuOpened}
            mode={forceBubbleMenu()}
            blur={() => {
              editor().commands.blur();
              setActiveElement(null);
              bubbleMenuInstance()?.hide();
            }}
          />
        </BubbleMenuWrapper>
        <Show when={breakpoints.md()}>
          <FloatingMenuWrapper
            editor={editor()}
            shouldShow={({ editor }) => {
              return shouldShowFloatingMenu(editor as SolidEditor);
            }}
          >
            <FloatingMenu editor={editor()} opened={floatingMenuOpened()} />
          </FloatingMenuWrapper>
        </Show>
        <Show when={!breakpoints.md()}>
          <Dropdown
            activatorButton={() => <div />}
            opened={blockMenuOpened()}
            setOpened={setBlockMenuOpened}
          >
            <BlockMenu
              items={blockMenuOptions()}
              close={() => setBlockMenuOpened(false)}
              editor={editor()}
            />
          </Dropdown>
        </Show>
      </Show>
      <SolidEditorContent editor={editor()} />
      {props.children}
    </div>
  );
};

export { Editor };
