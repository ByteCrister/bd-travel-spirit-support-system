import { OrganizerDocument, UserModel } from "@/models/user.model";
import { getDocumentStorageProvider } from "../storage-providers/documents";
import { STORAGE_PROVIDER } from "@/models/image.model";
import { GUIDE_DOCUMENT_CATEGORY } from "@/constants/guide.const";

export async function deleteOrganizerDocuments(userId: string, categories: GUIDE_DOCUMENT_CATEGORY[]) {
    const user = await UserModel.findById(userId);
    if (!user || !user.organizerProfile) throw new Error("User or organizer profile not found");

    for (const category of categories) {
        const docIndex = user.organizerProfile.documents.findIndex((d: OrganizerDocument) => d.category === category);
        if (docIndex === -1) continue;

        const doc = user.organizerProfile.documents[docIndex];
        const provider = getDocumentStorageProvider(STORAGE_PROVIDER.CLOUDINARY); // or from doc
        await provider.delete(doc.public_id);

        user.organizerProfile.documents.splice(docIndex, 1);
    }

    await user.save();
    return user.organizerProfile.documents;
}
