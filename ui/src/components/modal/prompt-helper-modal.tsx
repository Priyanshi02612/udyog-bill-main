import { MdClose } from "react-icons/md";

import { Button } from "../ui/button";

type PromptHelperModalProps = {
  open: boolean;
  exampleText: string;
  onClose: () => void;
  onUseExample: () => void;
};

const PromptHelperModal = ({
  open,
  exampleText,
  onClose,
  onUseExample,
}: PromptHelperModalProps) => {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="w-full max-w-2xl rounded-xl bg-white shadow-xl">
        <div className="flex items-start justify-between border-b border-slate-200 px-5 py-4">
          <div>
            <h4 className="text-lg font-bold text-slate-900">Raw Text Helper</h4>
            <p className="text-sm text-slate-500">
              Add customer, items, HSN, rates, and tax in plain language.
            </p>
          </div>
          <button
            type="button"
            className="text-slate-500 hover:text-slate-800"
            onClick={onClose}
          >
            <MdClose className="h-6 w-6" />
          </button>
        </div>

        <div className="space-y-4 px-5 py-4">
          <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
              Example Input
            </p>
            <pre className="whitespace-pre-wrap text-sm leading-6 text-slate-700">
              {exampleText}
            </pre>
          </div>

          <div className="text-sm text-slate-600">
            Include:
            <ul className="mt-2 list-disc space-y-1 pl-5">
              <li>Customer name</li>
              <li>Item name, quantity, unit and rate</li>
              <li>HSN code for each item</li>
              <li>Tax details like GST 5%, 12%, or 18%</li>
            </ul>
          </div>
        </div>

        <div className="flex justify-end gap-3 border-t border-slate-200 px-5 py-4">
          <Button size="sm" variant="outline-secondary" onClick={onClose}>
            Close
          </Button>
          <Button size="sm" onClick={onUseExample}>
            Use Example
          </Button>
        </div>
      </div>
    </div>
  );
};

export default PromptHelperModal;
