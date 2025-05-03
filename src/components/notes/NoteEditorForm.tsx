import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "../ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import type { NoteDetailDto } from "../../types";

// Form validation schema using Zod
const noteFormSchema = z.object({
  content: z
    .string()
    .min(1, { message: "Notatka nie może być pusta." })
    .max(5000, { message: "Notatka nie może przekraczać 5000 znaków." })
});

// Type inference from the schema
export type NoteFormValues = z.infer<typeof noteFormSchema>;

export interface NoteFormProps {
  noteId?: string;
  defaultValues?: NoteFormValues;
  onSubmit: (values: NoteFormValues) => Promise<void>;
  onCancel: () => void;
  isSubmitting: boolean;
  note?: NoteDetailDto | null;
}

const NoteEditorForm: React.FC<NoteFormProps> = ({
  noteId,
  defaultValues = { content: "" },
  onSubmit,
  onCancel,
  isSubmitting,
  note
}) => {
  // Initialize the form with react-hook-form and zod validation
  const form = useForm<NoteFormValues>({
    resolver: zodResolver(noteFormSchema),
    defaultValues: note ? { content: note.content } : defaultValues,
  });

  // Handle form submission
  const handleSubmit = form.handleSubmit(async (values) => {
    await onSubmit(values);
  });

  return (
    <Form {...form}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <FormField
          control={form.control}
          name="content"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Treść notatki</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Wpisz treść swojej notatki..."
                  className="min-h-[120px]"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <div className="flex justify-end space-x-3 pt-2">
          <Button 
            type="button" 
            variant="outline" 
            onClick={onCancel} 
            disabled={isSubmitting}
            className="w-full sm:w-auto"
          >
            Anuluj
          </Button>
          <Button 
            type="submit" 
            disabled={isSubmitting}
            className="w-full sm:w-auto"
          >
            {isSubmitting ? (
              <span className="flex items-center justify-center">
                <svg
                  className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Zapisuję...
              </span>
            ) : noteId ? (
              "Zapisz zmiany"
            ) : (
              "Zapisz notatkę"
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default NoteEditorForm;
