import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { faqConfig } from "@/config/faq";

export function PricingFaq() {
  return (
    <Accordion type="single" collapsible className="w-full">
      {faqConfig.items.map((faqItem) => (
        <AccordionItem key={faqItem.id} value={faqItem.id}>
          <AccordionTrigger className="text-base">
            <div className="text-left w-full">{faqItem.question}</div>
          </AccordionTrigger>
          <AccordionContent className="text-base text-muted-foreground whitespace-pre-wrap">
            {/* {faqItem.answer} */}
            {/* biome-ignore lint/security/noDangerouslySetInnerHtml: <explanation> */}
            <div dangerouslySetInnerHTML={{ __html: faqItem.answer }} />
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  );
}
