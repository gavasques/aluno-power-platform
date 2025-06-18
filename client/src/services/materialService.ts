import type { Material as DbMaterial, InsertMaterial } from '@shared/schema';
import type { MaterialFormData } from '@/components/admin/materials/MaterialFormTypes';

export class MaterialService {
  static createEmptyFormData(): MaterialFormData {
    return {
      title: "",
      description: "",
      typeId: "",
      categoryId: "",
      accessLevel: "public",
      fileUrl: "",
      fileName: "",
      fileSize: null,
      fileType: "",
      externalUrl: "",
      embedCode: "",
      embedUrl: "",
      videoUrl: "",
      videoDuration: null,
      videoThumbnail: "",
      tags: [],
    };
  }

  static convertDbMaterialToFormData(material: DbMaterial): MaterialFormData {
    return {
      title: material.title || "",
      description: material.description || "",
      typeId: material.typeId.toString(),
      categoryId: material.categoryId?.toString() || "",
      accessLevel: material.accessLevel as "public" | "restricted",
      fileUrl: material.fileUrl || "",
      fileName: material.fileName || "",
      fileSize: material.fileSize,
      fileType: material.fileType || "",
      externalUrl: material.externalUrl || "",
      embedCode: material.embedCode || "",
      embedUrl: material.embedUrl || "",
      videoUrl: material.videoUrl || "",
      videoDuration: material.videoDuration,
      videoThumbnail: material.videoThumbnail || "",
      tags: material.tags || [],
    };
  }

  static convertFormDataToInsertMaterial(formData: MaterialFormData, uploadedBy: number): InsertMaterial {
    return {
      title: formData.title,
      description: formData.description,
      typeId: parseInt(formData.typeId),
      categoryId: formData.categoryId ? parseInt(formData.categoryId) : null,
      accessLevel: formData.accessLevel,
      fileUrl: formData.fileUrl || null,
      fileName: formData.fileName || null,
      fileSize: formData.fileSize,
      fileType: formData.fileType || null,
      externalUrl: formData.externalUrl || null,
      embedCode: formData.embedCode || null,
      embedUrl: formData.embedUrl || null,
      videoUrl: formData.videoUrl || null,
      videoDuration: formData.videoDuration,
      videoThumbnail: formData.videoThumbnail || null,
      tags: formData.tags,
      uploadedBy,
    };
  }

  static validateFormData(formData: MaterialFormData): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!formData.title.trim()) {
      errors.push("Título é obrigatório");
    }

    if (!formData.description.trim()) {
      errors.push("Descrição é obrigatória");
    }

    if (!formData.typeId) {
      errors.push("Tipo de material é obrigatório");
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }
}