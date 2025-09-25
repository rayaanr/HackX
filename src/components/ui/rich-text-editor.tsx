"use client"

import {
  $getSelection,
  $isRangeSelection,
  FORMAT_TEXT_COMMAND,
  $createParagraphNode,
  $createTextNode,
  $getRoot,
  UNDO_COMMAND,
  REDO_COMMAND,
  FORMAT_ELEMENT_COMMAND,
  KEY_DOWN_COMMAND,
} from "lexical"
import { useCallback, useEffect, useState } from "react"
import { $setBlocksType } from "@lexical/selection"
import { $createHeadingNode, $createQuoteNode } from "@lexical/rich-text"
import { INSERT_ORDERED_LIST_COMMAND, INSERT_UNORDERED_LIST_COMMAND, ListNode } from "@lexical/list"
import { $isLinkNode, TOGGLE_LINK_COMMAND } from "@lexical/link"

import { LexicalComposer } from "@lexical/react/LexicalComposer"
import { RichTextPlugin } from "@lexical/react/LexicalRichTextPlugin"
import { ContentEditable } from "@lexical/react/LexicalContentEditable"
import { HistoryPlugin } from "@lexical/react/LexicalHistoryPlugin"
import { OnChangePlugin } from "@lexical/react/LexicalOnChangePlugin"
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext"
import { LexicalErrorBoundary } from "@lexical/react/LexicalErrorBoundary"
import { ListPlugin } from "@lexical/react/LexicalListPlugin"
import { LinkPlugin } from "@lexical/react/LexicalLinkPlugin"
import { AutoFocusPlugin } from "@lexical/react/LexicalAutoFocusPlugin"
import { TabIndentationPlugin } from "@lexical/react/LexicalTabIndentationPlugin"

// Plugin to prevent form submission on Enter
function PreventFormSubmitPlugin() {
  const [editor] = useLexicalComposerContext()

  useEffect(() => {
    return editor.registerCommand(
      KEY_DOWN_COMMAND,
      (event: KeyboardEvent) => {
        if (event.key === 'Enter' && !event.shiftKey) {
          event.stopPropagation()
        }
        return false
      },
      1
    )
  }, [editor])

  return null
}

// Plugin to handle external value changes (e.g., from form setValue)
function ValueSyncPlugin({ value }: { value?: string }) {
  const [editor] = useLexicalComposerContext()

  useEffect(() => {
    if (value !== undefined) {
      editor.update(() => {
        const root = $getRoot()
        const currentText = root.getTextContent()

        // Only update if the content is actually different
        if (currentText !== value) {
          root.clear()
          if (value) {
            const paragraph = $createParagraphNode()
            paragraph.append($createTextNode(value))
            root.append(paragraph)
          }
        }
      })
    }
  }, [editor, value])

  return null
}


import { HeadingNode, QuoteNode } from "@lexical/rich-text"
import { ListItemNode } from "@lexical/list"
import { AutoLinkNode, LinkNode } from "@lexical/link"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import {
  Bold,
  Italic,
  Underline,
  Strikethrough,
  List,
  ListOrdered,
  Quote,
  Heading1,
  Heading2,
  Heading3,
  Undo,
  Redo,
  Code,
  Type,
  Link,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  Highlighter,
} from "lucide-react"

const theme = {
  root: "p-4 border border-input bg-background text-foreground text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 min-h-[200px] rounded-md",
  link: "cursor-pointer text-primary hover:text-primary/80 underline",
  text: {
    bold: "font-bold text-foreground",
    underline: "underline text-foreground",
    italic: "italic text-foreground",
    strikethrough: "line-through text-foreground",
    underlineStrikethrough: "underline line-through text-foreground",
    code: "bg-muted text-foreground px-1 py-0.5 rounded text-sm font-mono",
    highlight: "bg-transparent px-1 rounded",
  },
  paragraph: "mb-2 text-foreground",
  quote: "border-l-4 border-muted-foreground/30 pl-4 italic text-muted-foreground my-4",
  heading: {
    h1: "text-3xl font-bold mb-4 mt-6 text-foreground",
    h2: "text-2xl font-bold mb-3 mt-5 text-foreground",
    h3: "text-xl font-bold mb-2 mt-4 text-foreground",
  },
  list: {
    nested: {
      listitem: "list-none text-foreground",
    },
    ol: "list-decimal list-inside mb-2 ml-4 text-foreground",
    ul: "list-disc list-inside mb-2 ml-4 text-foreground",
    listitem: "mb-1 text-foreground",
  },
}

function onError(error: Error) {
  console.error(error)
}

function ToolbarPlugin() {
  const [editor] = useLexicalComposerContext()
  const [isBold, setIsBold] = useState(false)
  const [isItalic, setIsItalic] = useState(false)
  const [isUnderline, setIsUnderline] = useState(false)
  const [isStrikethrough, setIsStrikethrough] = useState(false)
  const [isCode, setIsCode] = useState(false)
  const [isHighlight, setIsHighlight] = useState(false)
  const [isLink, setIsLink] = useState(false)
  const [linkUrl, setLinkUrl] = useState("")

  const $updateToolbar = useCallback(() => {
    const selection = $getSelection()
    if ($isRangeSelection(selection)) {
      setIsBold(selection.hasFormat("bold"))
      setIsItalic(selection.hasFormat("italic"))
      setIsUnderline(selection.hasFormat("underline"))
      setIsStrikethrough(selection.hasFormat("strikethrough"))
      setIsCode(selection.hasFormat("code"))
      setIsHighlight(selection.hasFormat("highlight"))

      const node = selection.anchor.getNode()
      const parent = node.getParent()
      setIsLink($isLinkNode(parent) || $isLinkNode(node))
    }
  }, [])

  useEffect(() => {
    return editor.registerUpdateListener(({ editorState }) => {
      editorState.read(() => {
        $updateToolbar()
      })
    })
  }, [editor, $updateToolbar])

  const formatText = (format: "bold" | "italic" | "underline" | "strikethrough" | "code" | "highlight" | "subscript" | "superscript") => {
    editor.dispatchCommand(FORMAT_TEXT_COMMAND, format)
  }

  const formatAlignment = (alignment: "left" | "center" | "right" | "justify" | "start" | "end") => {
    editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, alignment)
  }

  const insertLink = () => {
    if (linkUrl) {
      editor.dispatchCommand(TOGGLE_LINK_COMMAND, linkUrl)
      setLinkUrl("")
    }
  }

  const formatHeading = (headingSize: string) => {
    editor.update(() => {
      const selection = $getSelection()
      if ($isRangeSelection(selection)) {
        $setBlocksType(selection, () => $createHeadingNode(headingSize as any))
      }
    })
  }

  const formatParagraph = () => {
    editor.update(() => {
      const selection = $getSelection()
      if ($isRangeSelection(selection)) {
        $setBlocksType(selection, () => $createParagraphNode())
      }
    })
  }

  const formatQuote = () => {
    editor.update(() => {
      const selection = $getSelection()
      if ($isRangeSelection(selection)) {
        $setBlocksType(selection, () => $createQuoteNode())
      }
    })
  }

  const formatBulletList = () => {
    editor.dispatchCommand(INSERT_UNORDERED_LIST_COMMAND, undefined)
  }

  const formatNumberedList = () => {
    editor.dispatchCommand(INSERT_ORDERED_LIST_COMMAND, undefined)
  }

  return (
    <div className="flex flex-wrap items-center gap-2 p-2 border-b border-border bg-muted/20">
      {/* Text Formatting Group */}
      <div className="flex items-center border border-border rounded-md bg-background">
        <Button
          type="button"
          variant={isBold ? "default" : "ghost"}
          size="sm"
          onClick={() => formatText("bold")}
          title="Bold"
          className="rounded-none border-0 first:rounded-l-md"
        >
          <Bold className="h-4 w-4" />
        </Button>
        <div className="w-px h-6 bg-border" />
        <Button
          type="button"
          variant={isItalic ? "default" : "ghost"}
          size="sm"
          onClick={() => formatText("italic")}
          title="Italic"
          className="rounded-none border-0"
        >
          <Italic className="h-4 w-4" />
        </Button>
        <div className="w-px h-6 bg-border" />
        <Button
          type="button"
          variant={isUnderline ? "default" : "ghost"}
          size="sm"
          onClick={() => formatText("underline")}
          title="Underline"
          className="rounded-none border-0"
        >
          <Underline className="h-4 w-4" />
        </Button>
        <div className="w-px h-6 bg-border" />
        <Button
          type="button"
          variant={isStrikethrough ? "default" : "ghost"}
          size="sm"
          onClick={() => formatText("strikethrough")}
          title="Strikethrough"
          className="rounded-none border-0 last:rounded-r-md"
        >
          <Strikethrough className="h-4 w-4" />
        </Button>
      </div>

      {/* Special Text Formatting */}
      <div className="flex items-center border border-border rounded-md bg-background">
        <Button
          type="button"
          variant={isCode ? "default" : "ghost"}
          size="sm"
          onClick={() => formatText("code")}
          title="Code"
          className="rounded-none border-0 first:rounded-l-md"
        >
          <Code className="h-4 w-4" />
        </Button>
        <div className="w-px h-6 bg-border" />
        <Button
          type="button"
          variant={isHighlight ? "default" : "ghost"}
          size="sm"
          onClick={() => formatText("highlight")}
          title="Highlight"
          className="rounded-none border-0 last:rounded-r-md"
        >
          <Highlighter className="h-4 w-4" />
        </Button>
      </div>

      {/* Link Tools */}
      <div className="flex items-center border border-border rounded-md bg-background">
        <Popover>
          <PopoverTrigger asChild>
            <Button
              type="button"
              variant={isLink ? "default" : "ghost"}
              size="sm"
              title="Insert Link"
              className="rounded-md border-0"
            >
              <Link className="h-4 w-4" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80">
            <div className="flex gap-2">
              <Input
                placeholder="Enter URL..."
                value={linkUrl}
                onChange={(e) => setLinkUrl(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    insertLink()
                  }
                }}
              />
              <Button type="button" onClick={insertLink} size="sm">
                Add
              </Button>
            </div>
          </PopoverContent>
        </Popover>
      </div>

      {/* Block Types */}
      <div className="flex items-center border border-border rounded-md bg-background">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={formatParagraph}
          title="Paragraph"
          className="rounded-none border-0 first:rounded-l-md"
        >
          <Type className="h-4 w-4" />
        </Button>
        <div className="w-px h-6 bg-border" />
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => formatHeading("h1")}
          title="Heading 1"
          className="rounded-none border-0"
        >
          <Heading1 className="h-4 w-4" />
        </Button>
        <div className="w-px h-6 bg-border" />
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => formatHeading("h2")}
          title="Heading 2"
          className="rounded-none border-0"
        >
          <Heading2 className="h-4 w-4" />
        </Button>
        <div className="w-px h-6 bg-border" />
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => formatHeading("h3")}
          title="Heading 3"
          className="rounded-none border-0"
        >
          <Heading3 className="h-4 w-4" />
        </Button>
        <div className="w-px h-6 bg-border" />
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={formatQuote}
          title="Quote"
          className="rounded-none border-0 last:rounded-r-md"
        >
          <Quote className="h-4 w-4" />
        </Button>
      </div>

      {/* Lists */}
      <div className="flex items-center border border-border rounded-md bg-background">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={formatBulletList}
          title="Bullet List"
          className="rounded-none border-0 first:rounded-l-md"
        >
          <List className="h-4 w-4" />
        </Button>
        <div className="w-px h-6 bg-border" />
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={formatNumberedList}
          title="Numbered List"
          className="rounded-none border-0 last:rounded-r-md"
        >
          <ListOrdered className="h-4 w-4" />
        </Button>
      </div>

      {/* Text Alignment */}
      <div className="flex items-center border border-border rounded-md bg-background">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => formatAlignment("left")}
          title="Align Left"
          className="rounded-none border-0 first:rounded-l-md"
        >
          <AlignLeft className="h-4 w-4" />
        </Button>
        <div className="w-px h-6 bg-border" />
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => formatAlignment("center")}
          title="Align Center"
          className="rounded-none border-0"
        >
          <AlignCenter className="h-4 w-4" />
        </Button>
        <div className="w-px h-6 bg-border" />
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => formatAlignment("right")}
          title="Align Right"
          className="rounded-none border-0"
        >
          <AlignRight className="h-4 w-4" />
        </Button>
        <div className="w-px h-6 bg-border" />
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => formatAlignment("justify")}
          title="Justify"
          className="rounded-none border-0 last:rounded-r-md"
        >
          <AlignJustify className="h-4 w-4" />
        </Button>
      </div>

      {/* History */}
      <div className="flex items-center border border-border rounded-md bg-background">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.dispatchCommand(UNDO_COMMAND, undefined)}
          title="Undo"
          className="rounded-none border-0 first:rounded-l-md"
        >
          <Undo className="h-4 w-4" />
        </Button>
        <div className="w-px h-6 bg-border" />
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.dispatchCommand(REDO_COMMAND, undefined)}
          title="Redo"
          className="rounded-none border-0 last:rounded-r-md"
        >
          <Redo className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}

interface RichTextEditorProps {
  placeholder?: string
  onChange?: (editorState: string) => void
  initialValue?: string
  className?: string
}

export function RichTextEditor({
  placeholder = "Enter some rich text...",
  onChange,
  initialValue,
  className,
}: RichTextEditorProps) {
  const initialConfig = {
    namespace: "RichTextEditor",
    theme,
    onError,
    nodes: [HeadingNode, ListNode, ListItemNode, QuoteNode, AutoLinkNode, LinkNode],
  }

  return (
    <div className={`border border-input rounded-md bg-background ${className}`}>
      <LexicalComposer initialConfig={initialConfig}>
        <ToolbarPlugin />
        <div className="relative">
          <RichTextPlugin
            contentEditable={
              <ContentEditable
                className="min-h-[200px] p-4 outline-none resize-none overflow-auto prose prose-sm max-w-none text-foreground rounded-t-none border-none"
                style={{ caretColor: "hsl(var(--foreground))" }}
              />
            }
            placeholder={
              <p className="absolute top-4 left-4 text-muted-foreground pointer-events-none select-none font-medium text-sm">
                {placeholder}
              </p>
            }
            ErrorBoundary={LexicalErrorBoundary}
          />
          <OnChangePlugin
            onChange={(editorState) => {
              if (onChange) {
                editorState.read(() => {
                  const root = $getRoot()
                  const textContent = root.getTextContent()
                  // Return text content for validation (form expects string)
                  onChange(textContent || "")
                })
              }
            }}
          />
          <HistoryPlugin />
          <ListPlugin />
          <LinkPlugin />
          <AutoFocusPlugin />
          <TabIndentationPlugin />
          <PreventFormSubmitPlugin />
          <ValueSyncPlugin value={initialValue} />
        </div>
      </LexicalComposer>
    </div>
  )
}