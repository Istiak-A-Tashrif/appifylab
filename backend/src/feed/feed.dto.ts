import { Visibility } from "@prisma/client";
import {
  IsEnum,
  IsOptional,
  IsString,
  IsUrl,
  MaxLength,
  MinLength,
} from "class-validator";
export class CreatePostDto {
  @IsString() @MinLength(1) @MaxLength(5000) text: string;
  @IsEnum(Visibility) visibility: Visibility;
  @IsOptional()
  @IsUrl({ protocols: ["https"], require_protocol: true })
  imageUrl?: string;
}
export class CreateCommentDto {
  @IsString() @MinLength(1) @MaxLength(2000) body: string;
  @IsOptional() @IsString() parentId?: string;
}
