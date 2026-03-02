type StepGuideProps = {
  activeStep?: number;
};

const steps = [
  "สนามบินและเที่ยวบิน (Airport/Flight)",
  "เวลาเครื่องลง (Landing Time)",
  "จำนวนผู้โดยสาร (Passengers)",
  "ปลายทาง (Destination)",
  "ช่องทางติดต่อ (Contact)",
  "ยืนยันการจอง (Confirm)",
];

export function StepGuide({ activeStep = 6 }: StepGuideProps) {
  return (
    <ol className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
      {steps.map((step, index) => {
        const stepNumber = index + 1;
        const isActive = stepNumber <= activeStep;

        return (
          <li
            key={step}
            className={`flex items-center gap-3 rounded-xl border px-3 py-2 text-base ${
              isActive
                ? "border-sky-300 bg-sky-50 text-slate-800"
                : "border-slate-200 bg-white text-slate-500"
            }`}
          >
            <span
              className={`grid h-6 w-6 place-items-center rounded-full text-xs font-semibold ${
                isActive ? "bg-sky-600 text-white" : "bg-slate-200 text-slate-600"
              }`}
            >
              {stepNumber}
            </span>
            <span>{step}</span>
          </li>
        );
      })}
    </ol>
  );
}
