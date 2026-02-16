import {
  IsArray,
  IsEmail,
  IsEnum,
  IsIn,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
} from 'class-validator';
import { UserRole } from '../../db/schema/user.schema';
import { GstType, TaxMode } from '../../common/enums';

export class SignupDto {
  @IsEmail()
  @IsNotEmpty()
  email!: string;

  @IsString()
  @IsNotEmpty()
  firebaseUid!: string;

  @IsString()
  @IsNotEmpty()
  contactPerson!: string;

  @IsString()
  @IsNotEmpty()
  @Matches(/^\d{10}$/, { message: 'phone must be a valid 10 digit number' })
  phone!: string;

  @IsString()
  @IsNotEmpty()
  businessName!: string;

  @IsString()
  @IsNotEmpty()
  @Matches(/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z][1-9A-Z]Z[0-9A-Z]$/, {
    message: 'gstin must be a valid GSTIN',
  })
  gstin!: string;

  @IsString()
  @IsNotEmpty()
  registeredAddress!: string;

  @IsString()
  @IsNotEmpty()
  state!: string;

  @IsEnum(UserRole)
  role!: UserRole;

  @IsOptional()
  @IsIn(['NO_GST', 'GST_5', 'GST_12', 'GST_18'])
  gstType?: GstType;

  @IsOptional()
  @IsIn(['CGST_SGST', 'IGST'])
  gstTaxMode?: TaxMode;

  @IsOptional()
  @IsArray()
  financialYears?: Array<{
    id: string;
    label: string;
    range: string;
    startYear: number;
    endYear: number;
  }>;

  @IsOptional()
  @IsString()
  activeFinancialYearId?: string;
}
