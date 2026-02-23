/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { GoogleGenAI } from '@google/genai';
import { AIGeneratedInvoice } from 'src/common/types';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Item } from 'src/db/schema/item.schema';
import { User } from 'src/db/schema/user.schema';
import { UserBusinessDetails } from 'src/db/schema/user-business-details.schema';
import { GstType, TaxMode } from 'src/common/enums';

type GeminiClient = {
  models: {
    generateContent: (params: {
      model: string;
      contents: string;
      config: {
        temperature: number;
        responseMimeType: string;
      };
    }) => Promise<{ text?: string }>;
  };
};

@Injectable()
export class AiService {
  private readonly geminiApiKey: string;
  private readonly geminiModel: string;
  private readonly genAI: GeminiClient;

  constructor(
    @InjectModel(Item.name)
    private readonly itemModel: Model<Item>,

    @InjectModel(User.name)
    private readonly userModel: Model<User>,

    @InjectModel(UserBusinessDetails.name)
    private readonly userBusinessDetailsModel: Model<UserBusinessDetails>,
  ) {
    this.geminiApiKey = process.env.GEMINI_API_KEY ?? '';
    this.geminiModel = process.env.GEMINI_MODEL ?? 'gemini-2.0-flash';

    this.genAI = new GoogleGenAI({
      apiKey: this.geminiApiKey,
    }) as unknown as GeminiClient;
  }

  async generateInvoiceDraft(rawText: string, manufacturerId: string) {
    const existingManufacturer = await this.userModel.findById(manufacturerId);
    if (!existingManufacturer) {
      throw new BadRequestException('Manufacturer not found');
    }

    if (!this.geminiApiKey) {
      throw new BadRequestException('GEMINI_API_KEY is not configured');
    }

    // const prompt = this.buildInvoiceDraftPrompt(rawText);

    // const response = await this.genAI.models.generateContent({
    //   model: this.geminiModel,
    //   contents: prompt,
    //   config: {
    //     temperature: 0.1,
    //     responseMimeType: 'application/json',
    //   },
    // });

    // const rawModelOutput = response.text ?? '';

    // const cleanedJson = rawModelOutput
    //   .replace(/```json/g, '')
    //   .replace(/```/g, '')
    //   .trim();

    // const parsedData: AIGeneratedInvoice = JSON.parse(cleanedJson);

    const parsedData: AIGeneratedInvoice = {
      gstType: GstType.GST_12,
      cgst: 61200,
      sgst: 61200,
      igst: 0,
      roundOff: 0,
      buyerName: 'Om Sai Wholesale Shop',
      taxMode: TaxMode.CGST_SGST,
      totalGstAmount: 122400,
      taxableSubtotal: 1020000,
      totalAmountDue: 1142400,
      items: [
        {
          itemName: 'Dyed Silk Fabric – Green',
          hsnCode: 5007,
          quantity: 1200,
          unit: 'meters',
          basePrice: 850,
          gstPercentage: 12,
          taxableAmount: 1020000,
        },
        {
          itemName: 'Dyed Silk Fabric – Green',
          hsnCode: 5007,
          quantity: 1200,
          unit: 'meters',
          basePrice: 850,
          gstPercentage: 12,
          taxableAmount: 1020000,
        },
        {
          itemName: 'Dyed Silk Fabric – Green',
          hsnCode: 5007,
          quantity: 1200,
          unit: 'meters',
          basePrice: 850,
          gstPercentage: 12,
          taxableAmount: 1020000,
        },
        {
          itemName: 'Dyed Silk Fabric – Green',
          hsnCode: 5007,
          quantity: 1200,
          unit: 'meters',
          basePrice: 850,
          gstPercentage: 12,
          taxableAmount: 1020000,
        },
        {
          itemName: 'Dyed Silk Fabric – Green',
          hsnCode: 5007,
          quantity: 1200,
          unit: 'meters',
          basePrice: 850,
          gstPercentage: 12,
          taxableAmount: 1020000,
        },
        {
          itemName: 'Dyed Silk Fabric – Green',
          hsnCode: 5007,
          quantity: 1200,
          unit: 'meters',
          basePrice: 850,
          gstPercentage: 12,
          taxableAmount: 1020000,
        },
        {
          itemName: 'Dyed Silk Fabric – Green',
          hsnCode: 5007,
          quantity: 1200,
          unit: 'meters',
          basePrice: 850,
          gstPercentage: 12,
          taxableAmount: 1020000,
        },
        {
          itemName: 'Dyed Silk Fabric – Green',
          hsnCode: 5007,
          quantity: 1200,
          unit: 'meters',
          basePrice: 850,
          gstPercentage: 12,
          taxableAmount: 1020000,
        },
      ],
    };

    const wholesalerName = parsedData.buyerName;
    const existingWholesaler = await this.userBusinessDetailsModel.findOne({
      businessName: wholesalerName.trim(),
    });

    if (!existingWholesaler) {
      throw new NotFoundException('Wholesaler not found');
    }

    const aiGeneratedItems = parsedData.items.map((item) => ({
      name: item.itemName.trim(),
      basePrice: Number(item.basePrice),
      hsnCode: Number(item.hsnCode),
    }));

    aiGeneratedItems.forEach((item) => {
      if (isNaN(item.basePrice) || isNaN(item.hsnCode)) {
        throw new BadRequestException(
          `Invalid numeric value in item: ${item.name}`,
        );
      }
    });

    const existingItems = await this.itemModel
      .find({
        name: { $in: aiGeneratedItems.map((i) => i.name) },
      })
      .lean();

    const dbItemMap = new Map(existingItems.map((item) => [item.name, item]));

    const updatedItems: any[] = [];
    const mismatchedItems: any[] = [];

    for (const aiItem of aiGeneratedItems) {
      const dbItem = dbItemMap.get(aiItem.name);

      if (!dbItem) {
        mismatchedItems.push({
          name: aiItem.name,
          error: 'Item not found in system',
        });
        continue;
      }

      const fieldErrors: Record<string, any> = {};

      if (dbItem.basePrice !== aiItem.basePrice) {
        fieldErrors.basePrice = {
          expected: dbItem.basePrice,
          received: aiItem.basePrice,
        };
      }

      if (dbItem.hsnCode !== aiItem.hsnCode) {
        fieldErrors.hsnCode = {
          expected: dbItem.hsnCode,
          received: aiItem.hsnCode,
        };
      }

      if (Object.keys(fieldErrors).length > 0) {
        mismatchedItems.push({
          name: aiItem.name,
          mismatches: fieldErrors,
        });
      }

      updatedItems.push({
        ...parsedData.items.find((i) => i.itemName === aiItem.name),
        itemId: dbItem._id.toString(),
      });
    }

    if (mismatchedItems.length > 0) {
      throw new BadRequestException({
        message: 'Some invoice items have mismatched data',
        errorFields: mismatchedItems,
      });
    }

    const invoiceDate = new Date();

    const dueDate = new Date(
      Date.UTC(
        invoiceDate.getUTCFullYear(),
        invoiceDate.getUTCMonth(),
        invoiceDate.getUTCDate() + 5,
      ),
    );

    return {
      invoiceNumber: 'INV-AI-001',
      buyerInfo: existingWholesaler,
      sellerId: manufacturerId,
      invoiceDate,
      dueDate,
      gstType: parsedData.gstType,
      taxMode: parsedData.taxMode,
      items: updatedItems,
    };
  }

  private buildInvoiceDraftPrompt(rawText: string) {
    return `
      You are an invoice extraction engine.
      Extract invoice data from the user's raw text and return ONLY strict JSON.
      Do not add markdown, comments, or extra keys.

      Output schema (must be exactly this shape and key names):
      {
        "gstType": "NO_GST | GST_5 | GST_12 | GST_18",
        "cgst": "number",
        "sgst": "number",
        "igst": "number",
        "roundOff": "number",
        "buyerName": "string",
        "taxMode": "CGST_SGST | IGST",
        "totalGstAmount": "number",
        "taxableSubtotal": "number",
        "totalAmountDue": "number",
        "items": [
          {
            "itemName": "string",
            "hsnCode": "number",
            "quantity": "number",
            "unit": "string",
            "basePrice": "number",
            "gstPercentage": "number",
            "taxableAmount": "number"
          }
        ]
      }

      Rules:
      - Amounts are in INR.
      - Keep only line items with valid quantity and basePrice.
      - If HSN is missing, use 0.
      - If GST/tax mode is missing, default to gstRate=5 and taxMode=CGST_SGST.
      - If customer name is missing, use "Unknown Customer".

      Raw text: ${rawText}`.trim();
  }

  private addDaysUTC(days: number): Date {
    const now = new Date();

    return new Date(
      Date.UTC(
        now.getUTCFullYear(),
        now.getUTCMonth(),
        now.getUTCDate() + days,
      ),
    );
  }
}
