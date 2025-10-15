import { GuideDocument, UserModel } from "@/models/user.model";
import { getDocumentStorageProvider } from "../storage-providers/documents";
import { STORAGE_PROVIDER } from "@/models/image.model";
import { GUIDE_DOCUMENT_CATEGORY } from "@/constants/guide.const";

export async function updateGuideDocuments(
  userId: string,
  updates: {
    category: GUIDE_DOCUMENT_CATEGORY;
    newBase64: string;
    newFileName?: string;
  }[]
) {
  const user = await UserModel.findById(userId);
  if (!user || !user.guideProfile)
    throw new Error("User or organizer profile not found");

  const updatedDocs = await Promise.all(
    updates.map(async (update) => {
      const existingDoc = user.guideProfile!.documents.find(
        (d: GuideDocument) => d.category === update.category
      );
      if (!existingDoc)
        throw new Error(`Document not found for category: ${update.category}`);

      const provider = getDocumentStorageProvider(STORAGE_PROVIDER.CLOUDINARY); // or from existingDoc
      await provider.delete(existingDoc.public_id);

      const uploaded = await provider.create(
        update.newBase64,
        update.newFileName
      );

      existingDoc.url = uploaded.url;
      existingDoc.public_id = uploaded.public_id;
      existingDoc.fileName = uploaded.fileName;
      existingDoc.uploadedAt = new Date();

      return existingDoc;
    })
  );

  await user.save();
  return updatedDocs;
}
