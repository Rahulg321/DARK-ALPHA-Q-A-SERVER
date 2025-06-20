import { Router, type Request, type Response } from "express";
import authenticateToken from "../middleware/authenticate-token";
import { PDFLoader } from "../lib/pdf-loader";
import { generateText } from "ai";
import {
  googleGenAIProvider,
  openaiClient,
  openaiProvider,
} from "../lib/ai/providers";
import ExcelLoader from "../lib/excel-loader";
import { DocxLoader } from "../lib/docx-loader";
import { generateChunksFromText, rowsToTextChunks } from "../lib/ai/embedding";
import { generateEmbeddingsFromChunks } from "../lib/ai/utils";
import { db } from "../lib/db/queries";
import { embeddings as embeddingsTable, resources } from "../lib/db/schema";
import multer from "multer";

const upload = multer({
  storage: multer.memoryStorage(),
});

const router = Router();

router.post(
  "/",
  authenticateToken,
  upload.single("file"),
  async (req: Request, res: Response) => {
    console.log("inside api add resource");

    const file = req.file;
    const name = req.body.name as string;
    const description = req.body.description as string;
    const companyId = req.body.companyId as string;
    const categoryId = req.body.categoryId as string;

    if (!file) {
      throw new Error("No file provided");
    }

    if (!name) {
      throw new Error("No name provided");
    }

    if (!description) {
      throw new Error("No description provided");
    }

    if (!companyId) {
      throw new Error("No company ID provided");
    }

    if (!categoryId) {
      throw new Error("No category ID provided");
    }

    // Get file type
    const fileType = file.mimetype;
    const buffer = file.buffer;

    console.log("file type", fileType);

    let content: string = "";
    let sheets: Record<string, any[][]> | undefined;
    let chunks: any;
    let embeddingInput: string[];
    let kind: string = "";

    if (fileType === "application/pdf") {
      const pdfLoader = new PDFLoader();
      const rawContent = await pdfLoader.loadFromBuffer(buffer);

      console.log("analysing pdf using AI");
      const base64String = buffer.toString("base64");
      const response = await openaiClient.responses.create({
        model: "gpt-4o-mini",
        input: [
          {
            role: "user",
            content: [
              {
                type: "input_file",
                filename: file.originalname,
                file_data: `data:${fileType};base64,${base64String}`,
              },
              {
                type: "input_text",
                text: `Please analyze this PDF document and provide a comprehensive summary that includes:

1. Main Topic and Purpose
   - Identify the primary subject matter
   - Determine the document's intended purpose and audience

2. Key Points and Arguments
   - Extract and list the main arguments or findings
   - Highlight any significant data points or statistics
   - Note any conclusions or recommendations

3. Structure and Organization
   - Describe how the document is organized
   - Identify major sections and their purposes

4. Important Details
   - List any critical dates, names, or figures
   - Note any specific methodologies or approaches discussed
   - Highlight any unique or noteworthy elements

5. Context and Implications
   - Discuss the broader context or background
   - Note any potential implications or applications

Please format your response in a clear, structured manner that makes it easy to understand the document's key elements.`,
              },
            ],
          },
        ],
      });

      console.log("Result from analysing pdf using AI", response.output_text);

      // Combine raw content with AI summary
      content = `Name: ${name}\nDescription: ${description}\n\n Original Content:\n\n${rawContent}\n\nAI Analysis:\n\n${response.output_text}`;
      kind = "pdf";
    } else if (
      fileType === "application/vnd.ms-excel" ||
      fileType ===
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    ) {
      console.log("=== Processing Excel file ===");
      const excelLoader = new ExcelLoader();
      sheets = await excelLoader.loadExcelFromBuffer(buffer);
      console.log("Excel sheets loaded:", Object.keys(sheets));

      // Filter out empty rows and create meaningful content
      const excelContent = Object.entries(sheets)
        .map(([sheetName, rows]) => {
          console.log(
            `Processing sheet: ${sheetName}, Total rows: ${rows.length}`
          );

          // Filter out completely empty rows
          const nonEmptyRows = rows.filter((row) =>
            row.some(
              (cell) =>
                cell !== null &&
                cell !== undefined &&
                String(cell).trim() !== ""
            )
          );

          console.log(
            `Sheet ${sheetName}: ${nonEmptyRows.length} non-empty rows out of ${rows.length} total`
          );

          if (nonEmptyRows.length === 0) {
            return `Sheet: ${sheetName}\n(Empty sheet)`;
          }

          return `Sheet: ${sheetName}\n${nonEmptyRows
            .map((row, idx) => `Row ${idx + 1}: ${row.map(String).join(" | ")}`)
            .join("\n")}`;
        })
        .filter((content) => !content.includes("(Empty sheet)"))
        .join("\n\n");

      console.log("Excel content length:", excelContent.length);
      console.log(
        "Excel content preview (first 500 chars):",
        excelContent.substring(0, 500)
      );

      // Create content without AI analysis for Excel
      content = `Name: ${name}\nDescription: ${description}\n\n Original Content:\n\n${excelContent}`;
      kind = "excel";

      console.log("Final Excel content length:", content.length);
      console.log(
        "Final Excel content preview (first 500 chars):",
        content.substring(0, 500)
      );
    } else if (fileType === "application/msword") {
      throw new Error(
        "We do not support .doc files. Please upload a .docx file instead."
      );
    } else if (
      fileType ===
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    ) {
      console.log("=== Processing DOCX file ===");
      const docxLoader = new DocxLoader();
      const rawContent = await docxLoader.loadFromBuffer(buffer);
      console.log("DOCX raw content length:", rawContent.length);

      console.log("analysing docx using AI");
      const base64String = buffer.toString("base64");
      const response = await openaiClient.responses.create({
        model: "gpt-4o-mini",
        input: [
          {
            role: "user",
            content: [
              {
                type: "input_file",
                filename: file.originalname,
                file_data: `data:${fileType};base64,${base64String}`,
              },
              {
                type: "input_text",
                text: `Please analyze this DOCX document and provide a comprehensive summary that includes:

1. Main Topic and Purpose
   - Identify the primary subject matter
   - Determine the document's intended purpose and audience

2. Key Points and Arguments
   - Extract and list the main arguments or findings
   - Highlight any significant data points or statistics
   - Note any conclusions or recommendations

3. Structure and Organization
   - Describe how the document is organized
   - Identify major sections and their purposes

4. Important Details
   - List any critical dates, names, or figures
   - Note any specific methodologies or approaches discussed
   - Highlight any unique or noteworthy elements

5. Context and Implications
   - Discuss the broader context or background
   - Note any potential implications or applications

Please format your response in a clear, structured manner that makes it easy to understand the document's key elements.`,
              },
            ],
          },
        ],
      });

      console.log("Result from analysing docx using AI", response.output_text);

      // Combine raw content with AI summary
      content = `Name: ${name}\nDescription: ${description}\n\n Original Content:\n\n${rawContent}\n\nAI Analysis:\n\n${response.output_text}`;
      kind = "docx";

      console.log("Final DOCX content length:", content.length);
    } else if (fileType === "image/png" || fileType === "image/jpeg") {
      console.log("=== Processing Image file ===");
      const base64Image = Buffer.from(buffer).toString("base64");
      const response = await openaiClient.responses.create({
        model: "gpt-4o-mini",
        input: [
          {
            role: "user",
            content: [
              {
                type: "input_text",
                text: "Can you properly analyse this image for please. Extract any relevant text from the image which you may find relevant to the topic of the image. If you find any text, please extract it and return it as a string. If you don't find any text, please return an empty string. Apart from the text, give your detailed analysis of the image",
              },
              {
                type: "input_image",
                image_url: `data:${fileType};base64,${base64Image}`,
                detail: "auto", // or "low" or "high"
              },
            ],
          },
        ],
      });
      content = `Name: ${name}\nDescription: ${description}\n\n Original Content:\n\n${response.output_text}\n\nAI Analysis:\n\n${response.output_text}`;
      console.log("Result of analysing image using AI", response.output_text);
      kind = "image";
      console.log("Final Image content length:", content.length);
    } else if (fileType === "text/plain") {
      console.log("=== Processing Text file ===");
      const textContent = await file.buffer.toString();
      console.log("Text content length:", textContent.length);
      content = `Name: ${name}\nDescription: ${description}\n\n Original Content:\n\n${textContent}\n\n`;
      kind = "txt";
      console.log("Final Text content length:", content.length);
    } else {
      throw new Error("Unsupported file type");
    }

    console.log("=== Content Processing Complete ===");
    console.log("Final content length:", content.length);
    console.log("File kind:", kind);
    console.log(
      "Content preview (first 1000 chars):",
      content.substring(0, 1000)
    );

    // Generate chunks for all file types
    console.log("=== Generating Chunks ===");
    chunks = await generateChunksFromText(content);
    embeddingInput = chunks.chunks.map((chunk: any) => chunk.pageContent);
    console.log("Total chunks generated:", chunks.chunks.length);
    console.log(
      "First chunk preview:",
      chunks.chunks[0]?.pageContent?.substring(0, 200)
    );
    console.log(
      "Last chunk preview:",
      chunks.chunks[chunks.chunks.length - 1]?.pageContent?.substring(0, 200)
    );

    try {
      console.log("=== Generating Embeddings ===");
      const embeddings = await generateEmbeddingsFromChunks(embeddingInput);
      console.log("Embeddings generated:", embeddings.length);
      console.log("First embedding length:", embeddings[0]?.embedding?.length);

      console.log("=== Saving to Database ===");
      const [resource] = await db
        .insert(resources)
        .values({
          content,
          name,
          description,
          companyId,
          kind: kind as any,
          categoryId,
        })
        .returning();

      console.log("Resource saved with ID:", resource?.id);
      console.log("Resource content length in DB:", resource?.content?.length);

      await db.insert(embeddingsTable).values(
        embeddings.map((embedding) => ({
          resourceId: resource!.id,
          ...embedding,
        }))
      );

      console.log("Embeddings saved to database");
      console.log("Resource and embeddings were created successfully!!!");

      res.json({ message: "Resource added successfully" });
    } catch (error) {
      console.error("Error in database operations:", error);
      res.status(500).json({
        message:
          error instanceof Error ? error.message : "Internal server error",
      });
    }
  }
);

export default router;
