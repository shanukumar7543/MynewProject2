// /* eslint-disable no-underscore-dangle */
// import { sendEmail } from '@/lib/helpers';

// import { createNotifications } from '../api/handleNotifications';
// import DocumentAccess from '../models/DocumentAccess';
// import MasterDoc from '../models/MasterDocument';
// import User from '../models/User';

// export const sendEmailsForPublishProposeDocuments = async (
//   document: any,
//   user: any,
//   templateId: string,
//   subject: string,
//   documentId?: string
// ) => {
//   try {
//     // check for version of document
//     let newDocument;
//     if (document.version === 1) {
//       newDocument = document;
//     } else {
//       // get document from parent doc
//       newDocument = await MasterDoc.findById(document.parentID);
//     }

//     if (newDocument && newDocument.organization.length > 0) {
//       // get Organization Emails
//       const getOrganizationId = newDocument.organization.map(
//         async (item: any) => {
//           if (item.orgAccessType !== 'NONE') {
//             const query = {
//               'organization.organizationID': (item?.organizationID as any)?._id,
//             };

//             const organizationData = await User.find(query).exec();

//             const getUserEmail = organizationData
//               .map((el) => el.email)
//               .filter((el) => el !== user.email);
//             return getUserEmail;
//           }
//           return null;
//         }
//       );
//       const orgData = await Promise.all(getOrganizationId);
//       const orgEmails = orgData.flat();
//       // get Singular User Emails
//       const getSingularAccessEmail = await DocumentAccess.find({
//         documentID: newDocument._id,
//       });
//       const getUserIdForSingularAccessEmail: any = getSingularAccessEmail.map(
//         (el) => el.userID
//       );
//       const userData = await User.find({
//         _id: { $in: getUserIdForSingularAccessEmail },
//       });
//       const userDataEmail = userData
//         .map((el) => el.email)
//         .filter((el) => el !== user.email);
//       const emailToBeSend = [...new Set(orgEmails.concat(userDataEmail))];
//       const getOwnerName = await User.find(document?.createdBy);
//       let content;
//       if (subject === 'Document Change') {
//         content = `New version released for document ${document.name} by ${user?.firstName} ${user?.lastName}`;
//       } else {
//         content = `New version Proposed for document ${document.name} by ${getOwnerName[0]?.firstName} ${getOwnerName[0]?.lastName}`;
//       }
//       if (emailToBeSend.length > 0) {
//         await createNotifications(
//           emailToBeSend,
//           content,
//           documentId,
//           document.name
//         );
//         await sendEmail({
//           email: emailToBeSend as string[],
//           subject,
//           templateId,
//           editorName: `${user?.firstName} ${user?.lastName}`,
//           documentName: document.name,
//           docOwnerName: `${getOwnerName[0]?.firstName} ${getOwnerName[0]?.lastName}`,
//         });
//       }
//     }
//   } catch (error: any) {
//     console.log(error);
//   }
// };
