"use client";

import dynamic from "next/dynamic";
import { useState } from "react";
import "@uiw/react-md-editor/markdown-editor.css";
import "@uiw/react-markdown-preview/markdown.css";

const MDEditor = dynamic(
  () => import("@uiw/react-md-editor").then((m) => m.default),
  { ssr: false }
);

type Common = {
  placeholder?: string;
  minHeight?: number;
};

type Uncontrolled = Common & {
  name: string;
  defaultValue?: string;
  value?: never;
  onChange?: never;
};

type Controlled = Common & {
  value: string;
  onChange: (next: string) => void;
  name?: never;
  defaultValue?: never;
};

export function MarkdownInput(props: Uncontrolled | Controlled) {
  const { placeholder, minHeight = 240 } = props;

  if ("value" in props && typeof props.onChange === "function") {
    return (
      <div data-color-mode="light">
        <MDEditor
          value={props.value}
          onChange={(v) => props.onChange!(v ?? "")}
          height={minHeight}
          textareaProps={{ placeholder }}
        />
      </div>
    );
  }

  return (
    <UncontrolledMarkdown
      name={(props as Uncontrolled).name}
      defaultValue={(props as Uncontrolled).defaultValue}
      placeholder={placeholder}
      minHeight={minHeight}
    />
  );
}

function UncontrolledMarkdown({
  name,
  defaultValue = "",
  placeholder,
  minHeight = 240,
}: {
  name: string;
  defaultValue?: string;
  placeholder?: string;
  minHeight?: number;
}) {
  const [value, setValue] = useState(defaultValue);
  return (
    <div data-color-mode="light">
      <input type="hidden" name={name} value={value} />
      <MDEditor
        value={value}
        onChange={(v) => setValue(v ?? "")}
        height={minHeight}
        textareaProps={{ placeholder }}
      />
    </div>
  );
}
