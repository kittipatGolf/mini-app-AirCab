import { ContactMethod, contactMethodLabels } from "./types";

type ContactMethodSelectorProps = {
  value: ContactMethod;
  onChange: (method: ContactMethod) => void;
};

const methods: ContactMethod[] = ["whatsapp", "wechat", "line", "email"];

export function ContactMethodSelector({
  value,
  onChange,
}: ContactMethodSelectorProps) {
  return (
    <div className="grid grid-cols-2 gap-2">
      {methods.map((method) => {
        const isActive = method === value;

        return (
          <button
            key={method}
            type="button"
            onClick={() => onChange(method)}
            className={`rounded-lg border px-3 py-2 text-base font-medium transition ${
              isActive
                ? "border-sky-500 bg-sky-100 text-sky-900"
                : "border-slate-300 bg-white text-slate-700 hover:border-slate-400"
            }`}
          >
            {contactMethodLabels[method]}
          </button>
        );
      })}
    </div>
  );
}

