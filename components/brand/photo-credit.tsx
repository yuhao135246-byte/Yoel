type PhotoCreditProps = {
  text?: string;
  className?: string;
};

export function PhotoCredit({ text = "由观照摄影工作室提供", className = "" }: PhotoCreditProps) {
  return (
    <p
      className={`pointer-events-none absolute bottom-4 right-4 text-right text-[11px] font-normal text-[#9A9A9A] md:bottom-5 md:right-5 md:text-[12px] ${className}`}
    >
      {text}
    </p>
  );
}
