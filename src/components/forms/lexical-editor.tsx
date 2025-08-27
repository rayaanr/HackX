"use client";

import { LexicalComposer } from "@lexical/react/LexicalComposer";
import { RichTextPlugin } from "@lexical/react/LexicalRichTextPlugin";
import { ContentEditable } from "@lexical/react/LexicalContentEditable";
import { HistoryPlugin } from "@lexical/react/LexicalHistoryPlugin";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { LexicalErrorBoundary } from "@lexical/react/LexicalErrorBoundary";
import { ListPlugin } from "@lexical/react/LexicalListPlugin";
import { 
  $getSelection,
  $isRangeSelection,
  FORMAT_TEXT_COMMAND,
  FORMAT_ELEMENT_COMMAND,
  $createParagraphNode,
  $createTextNode,
  $isElementNode,
} from "lexical";
import { $generateHtmlFromNodes } from "@lexical/html";
import {
  INSERT_UNORDERED_LIST_COMMAND,
  INSERT_ORDERED_LIST_COMMAND,
  ListItemNode,
  ListNode,
} from "@lexical/list";
import {
  $createHeadingNode,
  $createQuoteNode,
  $isHeadingNode,
  $isQuoteNode,
  HeadingNode,
  QuoteNode,
} from "@lexical/rich-text";
import {
  $createCodeNode,
  $isCodeNode,
  CodeNode,
} from "@lexical/code";
import { mergeRegister } from "@lexical/utils";
import { MarkdownShortcutPlugin } from "@lexical/react/LexicalMarkdownShortcutPlugin";
import { TRANSFORMERS } from "@lexical/markdown";
import { LinkPlugin } from "@lexical/react/LexicalLinkPlugin";
import { LinkNode, TOGGLE_LINK_COMMAND } from "@lexical/link";
import { useCallback, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { 
  Bold, 
  Italic, 
  Underline,
  Code,
  Quote,
  Link,
  Highlighter,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  List, 
  ListOrdered, 
  Heading1, 
  Heading2, 
  Heading3,
  Type
} from "lucide-react";
import { cn } from "@/lib/utils";

// Color Highlighter Component
function ColorHighlighter({ onHighlight, isActive, size = 'sm' }: { onHighlight: (color: string) => void; isActive: boolean; size?: 'sm' | 'default' }) {
  const [open, setOpen] = useState(false);
  
  const colors = [
    { value: 'yellow', class: 'bg-yellow-200' },
    { value: 'green', class: 'bg-green-200' },
    { value: 'blue', class: 'bg-blue-200' },
    { value: 'pink', class: 'bg-pink-200' },
    { value: 'purple', class: 'bg-purple-200' },
    { value: 'orange', class: 'bg-orange-200' },
  ];

  const buttonClass = size === 'sm' ? "size-7 p-0" : "size-8 p-0";
  const iconClass = size === 'sm' ? "size-3" : "size-4";

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          size="sm"
          variant={isActive ? "default" : "ghost"}
          type="button"
          className={buttonClass}
          title="Highlight"
        >
          <Highlighter className={iconClass} />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-48" align="center">
        <div className="space-y-2">
          <h4 className="text-sm font-medium">Choose highlight color</h4>
          <div className="grid grid-cols-3 gap-2">
            {colors.map((color) => (
              <Button
                key={color.value}
                variant="ghost"
                size={'icon'}
                className={`h-8 w-full justify-start gap-2 ${color.class} hover:opacity-80`}
                onClick={() => {
                  onHighlight(color.value);
                  setOpen(false);
                }}
              >
                <div className={`size-4 rounded-full ${color.class}`} />
              </Button>
            ))}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}

// Link Popover Component
function LinkPopover({ onInsertLink, disabled, size = 'sm' }: { onInsertLink: (url: string) => void; disabled?: boolean; size?: 'sm' | 'default' }) {
  const [url, setUrl] = useState("");
  const [open, setOpen] = useState(false);

  const handleInsert = () => {
    if (url.trim()) {
      onInsertLink(url.trim());
      setUrl("");
      setOpen(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleInsert();
    }
    if (e.key === 'Escape') {
      setOpen(false);
      setUrl("");
    }
  };

  const buttonClass = size === 'sm' ? "h-7 w-7 p-0" : "h-8 w-8 p-0";
  const iconClass = size === 'sm' ? "h-3 w-3" : "h-4 w-4";

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          size="sm"
          variant="ghost"
          type="button"
          className={buttonClass}
          title="Insert Link"
          disabled={disabled}
        >
          <Link className={iconClass} />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80" align="center">
        <div className="space-y-2">
          <h4 className="text-sm font-medium">Insert Link</h4>
          <Input
            placeholder="Enter URL..."
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            onKeyDown={handleKeyDown}
            autoFocus
          />
          <div className="flex justify-end gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                setOpen(false);
                setUrl("");
              }}
            >
              Cancel
            </Button>
            <Button size="sm" onClick={handleInsert} disabled={!url.trim()}>
              Insert
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}

// Define the theme for the editor
const theme = {
  ltr: "ltr",
  rtl: "rtl",
  placeholder: "editor-placeholder",
  paragraph: "editor-paragraph",
  quote: "editor-quote",
  heading: {
    h1: "editor-heading-h1",
    h2: "editor-heading-h2",
    h3: "editor-heading-h3",
    h4: "editor-heading-h4",
    h5: "editor-heading-h5",
  },
  list: {
    nested: {
      listitem: "editor-nested-listitem",
    },
    ol: "editor-list-ol",
    ul: "editor-list-ul",
    listitem: "editor-listitem",
  },
  image: "editor-image",
  link: "editor-link",
  text: {
    bold: "editor-text-bold",
    italic: "editor-text-italic",
    overflowed: "editor-text-overflowed",
    hashtag: "editor-text-hashtag",
    underline: "editor-text-underline",
    strikethrough: "editor-text-strikethrough",
    underlineStrikethrough: "editor-text-underlineStrikethrough",
    code: "editor-text-code",
  },
  code: "editor-code",
  codeHighlight: {
    atrule: "editor-tokenAttr",
    attr: "editor-tokenAttr",
    boolean: "editor-tokenProperty",
    builtin: "editor-tokenSelector",
    cdata: "editor-tokenComment",
    char: "editor-tokenSelector",
    class: "editor-tokenFunction",
    "class-name": "editor-tokenFunction",
    comment: "editor-tokenComment",
    constant: "editor-tokenProperty",
    deleted: "editor-tokenProperty",
    doctype: "editor-tokenComment",
    entity: "editor-tokenOperator",
    function: "editor-tokenFunction",
    important: "editor-tokenVariable",
    inserted: "editor-tokenSelector",
    keyword: "editor-tokenAttr",
    namespace: "editor-tokenVariable",
    number: "editor-tokenProperty",
    operator: "editor-tokenOperator",
    prolog: "editor-tokenComment",
    property: "editor-tokenProperty",
    punctuation: "editor-tokenPunctuation",
    regex: "editor-tokenVariable",
    selector: "editor-tokenSelector",
    string: "editor-tokenSelector",
    symbol: "editor-tokenProperty",
    tag: "editor-tokenProperty",
    url: "editor-tokenOperator",
    variable: "editor-tokenVariable",
  },
};

// Toolbar Plugin
function ToolbarPlugin() {
  const [editor] = useLexicalComposerContext();
  const [isBold, setIsBold] = useState(false);
  const [isItalic, setIsItalic] = useState(false);
  const [isUnderline, setIsUnderline] = useState(false);
  const [isHighlight, setIsHighlight] = useState(false);
  const [isCode, setIsCode] = useState(false);
  const [blockType, setBlockType] = useState('paragraph');
  const [alignment, setAlignment] = useState('left');
  const [hasSelection, setHasSelection] = useState(false);

  const updateToolbar = useCallback(() => {
    const selection = $getSelection();
    if ($isRangeSelection(selection)) {
      setIsBold(selection.hasFormat('bold'));
      setIsItalic(selection.hasFormat('italic'));
      setIsUnderline(selection.hasFormat('underline'));
      setIsHighlight(selection.hasFormat('highlight'));
      setIsCode(selection.hasFormat('code'));
      setHasSelection(!selection.isCollapsed());

      // Get block type and alignment
      const anchorNode = selection.anchor.getNode();
      const element = anchorNode.getKey() === 'root' ? anchorNode : anchorNode.getTopLevelElementOrThrow();
      
      if ($isHeadingNode(element)) {
        setBlockType(element.getTag());
      } else if ($isQuoteNode(element)) {
        setBlockType('quote');
      } else if ($isCodeNode(element)) {
        setBlockType('code');
      } else {
        setBlockType('paragraph');
      }

      // Get alignment (if element supports it)
      if ($isElementNode(element)) {
        setAlignment(element.getFormatType() || 'left');
      }
    } else {
      setHasSelection(false);
    }
  }, []);

  useEffect(() => {
    return mergeRegister(
      editor.registerUpdateListener(({ editorState }) => {
        editorState.read(() => {
          updateToolbar();
        });
      })
    );
  }, [editor, updateToolbar]);

  const formatText = (format: string) => {
    editor.dispatchCommand(FORMAT_TEXT_COMMAND, format as any);
  };

  const formatAlignment = (alignment: 'left' | 'center' | 'right' | 'justify') => {
    editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, alignment);
  };

  const formatBlock = (blockType: string) => {
    editor.update(() => {
      const selection = $getSelection();
      if ($isRangeSelection(selection)) {
        const anchorNode = selection.anchor.getNode();
        const element = anchorNode.getKey() === 'root' ? anchorNode : anchorNode.getTopLevelElementOrThrow();
        
        // Get existing content
        const textContent = element.getTextContent();
        let newElement;
        
        if (blockType === 'paragraph') {
          newElement = $createParagraphNode();
        } else if (blockType === 'h3') {
          newElement = $createHeadingNode('h3');
        } else if (blockType === 'quote') {
          newElement = $createQuoteNode();
        } else if (blockType === 'code') {
          newElement = $createCodeNode();
        }
        
        if (newElement) {
          element.replace(newElement);
          
          // Transfer content to new element
          if (textContent) {
            const textNode = $createTextNode(textContent);
            newElement.append(textNode);
          }
          
          // Set selection to the new element
          newElement.selectEnd();
        }
      }
    });
  };

  const insertLink = (url: string) => {
    editor.dispatchCommand(TOGGLE_LINK_COMMAND, url);
  };

  const handleHighlight = (color: string) => {
    // For now, just apply regular highlight formatting
    // In a full implementation, you'd use color-specific formatting
    formatText('highlight');
  };

  const formatHeading = (headingSize: 'h1' | 'h2' | 'h3') => {
    editor.update(() => {
      const selection = $getSelection();
      if ($isRangeSelection(selection)) {
        const anchorNode = selection.anchor.getNode();
        const element = anchorNode.getKey() === 'root' ? anchorNode : anchorNode.getTopLevelElementOrThrow();
        const newHeading = $createHeadingNode(headingSize);
        
        // Transfer existing content to the new heading
        const textContent = element.getTextContent();
        element.replace(newHeading);
        
        if (textContent) {
          const textNode = $createTextNode(textContent);
          newHeading.append(textNode);
        }
        
        // Set selection to the new heading
        newHeading.selectEnd();
      }
    });
  };

  const formatList = (listType: 'bullet' | 'number') => {
    if (listType === 'bullet') {
      editor.dispatchCommand(INSERT_UNORDERED_LIST_COMMAND, undefined);
    } else {
      editor.dispatchCommand(INSERT_ORDERED_LIST_COMMAND, undefined);
    }
  };

  return (
    <div className="flex items-center gap-1 border-b border-border p-2 bg-muted/30 flex-wrap">
      {/* Text Formatting */}
      <Button
        size="sm"
        variant={isBold ? "default" : "ghost"}
        onClick={() => formatText('bold')}
        type="button"
        className="h-8 w-8 p-0"
        title="Bold"
      >
        <Bold className="h-4 w-4" />
      </Button>
      <Button
        size="sm"
        variant={isItalic ? "default" : "ghost"}
        onClick={() => formatText('italic')}
        type="button"
        className="h-8 w-8 p-0"
        title="Italic"
      >
        <Italic className="h-4 w-4" />
      </Button>
      <Button
        size="sm"
        variant={isUnderline ? "default" : "ghost"}
        onClick={() => formatText('underline')}
        type="button"
        className="h-8 w-8 p-0"
        title="Underline"
      >
        <Underline className="h-4 w-4" />
      </Button>
      <ColorHighlighter onHighlight={handleHighlight} isActive={isHighlight} size="default" />
      <Button
        size="sm"
        variant={isCode ? "default" : "ghost"}
        onClick={() => formatText('code')}
        type="button"
        className="h-8 w-8 p-0"
        title="Code"
      >
        <Code className="h-4 w-4" />
      </Button>

      <Separator orientation="vertical" className="mx-1 h-4" />

      {/* Block Formatting */}
      <Button
        size="sm"
        variant={blockType === 'paragraph' ? "default" : "ghost"}
        onClick={() => formatBlock('paragraph')}
        type="button"
        className="h-8 w-8 p-0"
        title="Normal"
      >
        <Type className="h-4 w-4" />
      </Button>
      <Button
        size="sm"
        variant="ghost"
        onClick={() => formatHeading('h1')}
        type="button"
        className="h-8 w-8 p-0"
        title="Heading 1"
      >
        <Heading1 className="h-4 w-4" />
      </Button>
      <Button
        size="sm"
        variant="ghost"
        onClick={() => formatHeading('h2')}
        type="button"
        className="h-8 w-8 p-0"
        title="Heading 2"
      >
        <Heading2 className="h-4 w-4" />
      </Button>
      <Button
        size="sm"
        variant={blockType === 'h3' ? "default" : "ghost"}
        onClick={() => formatBlock('h3')}
        type="button"
        className="h-8 w-8 p-0"
        title="Heading 3"
      >
        <Heading3 className="h-4 w-4" />
      </Button>
      <Button
        size="sm"
        variant={blockType === 'quote' ? "default" : "ghost"}
        onClick={() => formatBlock('quote')}
        type="button"
        className="h-8 w-8 p-0"
        title="Quote"
      >
        <Quote className="h-4 w-4" />
      </Button>

      <Separator orientation="vertical" className="mx-1 h-4" />

      {/* Lists */}
      <Button
        size="sm"
        variant="ghost"
        onClick={() => formatList('bullet')}
        type="button"
        className="h-8 w-8 p-0"
        title="Bullet List"
      >
        <List className="h-4 w-4" />
      </Button>
      <Button
        size="sm"
        variant="ghost"
        onClick={() => formatList('number')}
        type="button"
        className="h-8 w-8 p-0"
        title="Numbered List"
      >
        <ListOrdered className="h-4 w-4" />
      </Button>

      <Separator orientation="vertical" className="mx-1 h-4" />

      {/* Alignment */}
      <Button
        size="sm"
        variant={alignment === 'left' ? "default" : "ghost"}
        onClick={() => formatAlignment('left')}
        type="button"
        className="h-8 w-8 p-0"
        title="Align Left"
      >
        <AlignLeft className="h-4 w-4" />
      </Button>
      <Button
        size="sm"
        variant={alignment === 'center' ? "default" : "ghost"}
        onClick={() => formatAlignment('center')}
        type="button"
        className="h-8 w-8 p-0"
        title="Align Center"
      >
        <AlignCenter className="h-4 w-4" />
      </Button>
      <Button
        size="sm"
        variant={alignment === 'right' ? "default" : "ghost"}
        onClick={() => formatAlignment('right')}
        type="button"
        className="h-8 w-8 p-0"
        title="Align Right"
      >
        <AlignRight className="h-4 w-4" />
      </Button>
      <Button
        size="sm"
        variant={alignment === 'justify' ? "default" : "ghost"}
        onClick={() => formatAlignment('justify')}
        type="button"
        className="h-8 w-8 p-0"
        title="Justify"
      >
        <AlignJustify className="h-4 w-4" />
      </Button>

      <Separator orientation="vertical" className="mx-1 h-4" />

      {/* Link */}
      <LinkPopover onInsertLink={insertLink} disabled={!hasSelection} size="default" />
    </div>
  );
}


// Define initial config for the editor
const initialConfig = {
  namespace: "HackathonDescriptionEditor",
  theme,
  onError: (error: Error) => {
    console.error(error);
  },
  nodes: [HeadingNode, ListNode, ListItemNode, QuoteNode, CodeNode, LinkNode],
};

// Placeholder component
function Placeholder({ placeholder }: { placeholder: string }) {
  return (
    <div className="editor-placeholder absolute top-4 left-4 text-gray-300 pointer-events-none">
      {placeholder}
    </div>
  );
}

interface LexicalEditorProps {
  onChange: (content: string) => void;
  initialContent?: string;
  placeholder?: string;
  className?: string;
}

// OnChange Plugin with HTML serialization
function OnChangePluginWithHTML({ onChange }: { onChange: (content: string) => void }) {
  const [editor] = useLexicalComposerContext();
  
  useEffect(() => {
    return editor.registerUpdateListener(({ editorState }) => {
      editorState.read(() => {
        // Get HTML content instead of just plain text
        const htmlContent = $generateHtmlFromNodes(editor, null);
        onChange(htmlContent);
      });
    });
  }, [editor, onChange]);

  return null;
}

export function LexicalEditor({
  onChange,
  initialContent,
  placeholder = "Enter description...",
  className,
}: LexicalEditorProps) {
  return (
    <LexicalComposer initialConfig={{ ...initialConfig }}>
      <div className={cn("relative rounded-md border bg-background overflow-hidden", className)}>
        <ToolbarPlugin />
        <div className="relative">
          <RichTextPlugin
            contentEditable={
              <ContentEditable className="min-h-[150px] outline-none p-4 resize-none focus:ring-0" />
            }
            placeholder={<Placeholder placeholder={placeholder} />}
            ErrorBoundary={LexicalErrorBoundary}
          />
          <OnChangePluginWithHTML onChange={onChange} />
          <HistoryPlugin />
          <ListPlugin />
          <LinkPlugin />
          <MarkdownShortcutPlugin transformers={TRANSFORMERS} />
        </div>
      </div>
    </LexicalComposer>
  );
}