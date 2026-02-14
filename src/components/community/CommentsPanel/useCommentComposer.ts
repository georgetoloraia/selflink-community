import { useCallback, useEffect, useRef, useState } from "react";
import type { Dispatch, RefObject, SetStateAction } from "react";
import { COMMENT_TEMPLATES, PLACEHOLDER } from "./commentTemplates";

type UseCommentComposerResult = {
  body: string;
  setBody: Dispatch<SetStateAction<string>>;
  isComposerOpen: boolean;
  openOverlayFromInline: () => void;
  closeOverlay: () => void;
  applyTemplateFromButton: (templateValue: string, buttonEl: HTMLButtonElement | null) => void;
  editorFontSize: number;
  setEditorFontSize: Dispatch<SetStateAction<number>>;
  clampFontSize: (value: number) => number;
  selectedTemplate: string;
  onTemplateSelect: (label: string) => void;
  inlineTextareaRef: RefObject<HTMLTextAreaElement | null>;
  overlayTextareaRef: RefObject<HTMLTextAreaElement | null>;
};

const PLACEHOLDER_TOKEN = "${PLACEHOLDER}";

export const useCommentComposer = (placeholder: string = PLACEHOLDER): UseCommentComposerResult => {
  const [body, setBody] = useState("");
  const [isComposerOpen, setIsComposerOpen] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState("");
  const [editorFontSize, setEditorFontSize] = useState(15);
  const [selectionTick, setSelectionTick] = useState(0);

  const inlineTextareaRef = useRef<HTMLTextAreaElement | null>(null);
  const overlayTextareaRef = useRef<HTMLTextAreaElement | null>(null);
  const lastRoleButtonRef = useRef<HTMLButtonElement | null>(null);
  const pendingTemplateSelectRef = useRef(false);
  const suppressNextInlineOpenRef = useRef(false);

  const clampFontSize = useCallback((value: number) => Math.min(22, Math.max(12, value)), []);

  const applyTemplateFromButton = useCallback(
    (templateValue: string, buttonEl: HTMLButtonElement | null) => {
      const template = templateValue.replaceAll(PLACEHOLDER_TOKEN, placeholder);
      setBody((prev) => {
        const trimmed = prev.trim();
        return trimmed ? `${prev}\n\n${template}` : template;
      });
      lastRoleButtonRef.current = buttonEl;
      pendingTemplateSelectRef.current = true;
      setIsComposerOpen(true);
      setSelectionTick((tick) => tick + 1);
    },
    [placeholder]
  );

  const onTemplateSelect = useCallback(
    (label: string) => {
      setSelectedTemplate(label);
      const selected = COMMENT_TEMPLATES.find((template) => template.label === label);
      if (!selected) return;
      applyTemplateFromButton(selected.value, null);
      setSelectedTemplate("");
    },
    [applyTemplateFromButton]
  );

  const openOverlayFromInline = useCallback(() => {
    if (suppressNextInlineOpenRef.current) {
      suppressNextInlineOpenRef.current = false;
      return;
    }
    if (isComposerOpen) return;
    lastRoleButtonRef.current = null;
    pendingTemplateSelectRef.current = false;
    setIsComposerOpen(true);
  }, [isComposerOpen]);

  const closeOverlay = useCallback(() => {
    setIsComposerOpen(false);
    setSelectedTemplate("");
    requestAnimationFrame(() => {
      if (lastRoleButtonRef.current) {
        lastRoleButtonRef.current.focus();
      } else {
        suppressNextInlineOpenRef.current = true;
        inlineTextareaRef.current?.focus();
      }
    });
  }, []);

  useEffect(() => {
    if (!isComposerOpen) return;
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        closeOverlay();
      }
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [isComposerOpen, closeOverlay]);

  useEffect(() => {
    if (!isComposerOpen) return;
    requestAnimationFrame(() => {
      const textarea = overlayTextareaRef.current;
      if (!textarea) return;
      textarea.focus();
      if (pendingTemplateSelectRef.current) {
        const index = textarea.value.indexOf(placeholder);
        if (index >= 0) {
          textarea.setSelectionRange(index, index + placeholder.length);
        } else {
          const length = textarea.value.length;
          textarea.setSelectionRange(length, length);
        }
        pendingTemplateSelectRef.current = false;
        return;
      }
      const length = textarea.value.length;
      textarea.setSelectionRange(length, length);
    });
  }, [isComposerOpen, selectionTick, placeholder]);

  return {
    body,
    setBody,
    isComposerOpen,
    openOverlayFromInline,
    closeOverlay,
    applyTemplateFromButton,
    editorFontSize,
    setEditorFontSize,
    clampFontSize,
    selectedTemplate,
    onTemplateSelect,
    inlineTextareaRef,
    overlayTextareaRef,
  };
};
