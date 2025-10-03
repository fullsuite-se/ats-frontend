import { useEffect, useState } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import useUserStore from '../../context/userStore';
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import TextAlign from "@tiptap/extension-text-align";
import CodeBlock from "@tiptap/extension-code-block";
import Blockquote from "@tiptap/extension-blockquote";
import { generateJSON } from "@tiptap/html";
import {
  BoldIcon,
  ItalicIcon,
  UnderlineIcon,
  ListBulletIcon,
  Bars3BottomLeftIcon,
  Bars3CenterLeftIcon,
  Bars3BottomRightIcon,
  TrashIcon,
  PencilSquareIcon,
  EyeIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import api from "../../services/api";
import ConfirmationModal from "../Modals/ConfirmationModal";
import SendMailToast from "../../assets/SendMailToast";
import BulletList from "@tiptap/extension-bullet-list";
import Loader from "../Loader";

function ApplicantSendMailPage({ applicant }) {
  const [subject, setSubject] = useState("");
  const [attachments, setAttachments] = useState([]);
  const [emailContent, setEmailContent] = useState("");
  const [templates, setTemplates] = useState([]);
  const [selectedTemplate, setSelectedTemplate] = useState("");
  const [selectedTemplateId, setSelectedTemplateId] = useState(null);
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [templateTitle, setTemplateTitle] = useState("");
  const [showConfirmationModal, setShowConfirmationModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [templateToDelete, setTemplateToDelete] = useState(null);
  const [isEditingTemplate, setIsEditingTemplate] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [isSendingEmail, setIsSendingEmail] = useState(false); // New state for loading
  const { user } = useUserStore();
  const [toasts, setToasts] = useState([]);

  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      BulletList,
      CodeBlock,
      Blockquote,
      TextAlign.configure({ 
        types: ["heading", "paragraph"],
        alignments: ['left', 'center', 'right'],
      }),
    ],
    editorProps: {
      attributes: {
        class: 'body-regular border border-gray-light rounded-lg min-h-[300px] p-5 mx-auto focus:outline-none prose prose-sm sm:prose-base max-w-none',
      },
    },
    content: emailContent,
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      setEmailContent(html);
    },
  });

  const fetchTemplates = () => {
    api
      .get("/email/templates")
      .then((response) => {
        setTemplates(response.data.templates);
      })
      .catch((error) => console.error("Error fetching data:", error.message));
  };

  useEffect(() => {
    if (showTemplateModal || showDeleteModal || showPreview || isSendingEmail) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }

    return () => {
      document.body.style.overflow = "";
    };
  }, [showTemplateModal, showDeleteModal, showPreview, isSendingEmail]);

  useEffect(() => {
    fetchTemplates();
  }, []);

  // Function to generate the exact email preview
  const generateEmailPreview = () => {
    if (!emailContent) return '';

    // Process content similar to backend
    const processedContent = emailContent
      .replace(/<p><br><\/p>/g, '<p style="margin: 10px 0; line-height: 1.6;">&nbsp;</p>')
      .replace(/<p><\/p>/g, '<p style="margin: 10px 0; line-height: 1.6;">&nbsp;</p>')
      .replace(/<p>/g, '<p style="margin: 10px 0; line-height: 1.6;">')
      .replace(/<ul>/g, '<ul style="padding-left: 20px; margin: 10px 0;">')
      .replace(/<ol>/g, '<ol style="padding-left: 20px; margin: 10px 0;">')
      .replace(/<li>/g, '<li style="margin: 5px 0; line-height: 1.6;">')
      .replace(/<h1>/g, '<h1 style="font-size: 24px; margin: 20px 0 10px 0; font-weight: bold; line-height: 1.3;">')
      .replace(/<h2>/g, '<h2 style="font-size: 20px; margin: 18px 0 9px 0; font-weight: bold; line-height: 1.3;">')
      .replace(/<h3>/g, '<h3 style="font-size: 18px; margin: 16px 0 8px 0; font-weight: bold; line-height: 1.3;">')
      .replace(/<blockquote>/g, '<blockquote style="border-left: 4px solid #008080; margin: 10px 0; padding-left: 16px; font-style: italic; color: #666; line-height: 1.6;">')
      .replace(/<pre>/g, '<pre style="background: #f4f4f4; padding: 10px; border-radius: 4px; overflow-x: auto; font-family: monospace; line-height: 1.4;">')
      .replace(/<code>/g, '<code style="background: #f4f4f4; padding: 2px 4px; border-radius: 3px; font-family: monospace;">')
      .replace(/<u>/g, '<u style="text-decoration: underline;">')
      .replace(/<strong>/g, '<strong style="font-weight: bold;">')
      .replace(/<em>/g, '<em style="font-style: italic;">')
      .replace(/&lt;Applicant's Name&gt;|Applicant's Name/g, applicant?.first_name || 'Applicant');

    // Generate email signature similar to backend
    const emailSignatureString = `
      <div style="font-family: Arial, sans-serif; color: #333; padding: 15px 0; border-top: 2px solid #008080; margin-top: 20px;">
        <div style="display: flex; align-items: center;">
          <img src="${user?.company_logo || 'https://via.placeholder.com/80x80?text=Logo'}" alt="Company Logo" width="80" height="80" style="border-radius: 10px; margin-right: 15px;">
          <div>
            <p style="margin: 5px 0; font-size: 14px; font-weight: bold;">${user?.first_name || ''} ${user?.last_name || ''}</p>
            <p style="margin: 5px 0; font-size: 14px;">${user?.job_title || 'Team Member'} | <a href="https://${user?.company_name || 'company'}.com" style="color: #008080; text-decoration: none;">${user?.company_name || 'Company'}</a></p>
            <p style="margin: 5px 0; font-size: 14px;">${user?.contact_number ? `📞 ${user.contact_number}` : ''} ${user?.contact_number && user?.user_email ? '|' : ''} ${user?.user_email ? `✉️ <a href="mailto:${user.user_email}" style="color: #008080; text-decoration: none;">${user.user_email}</a>` : ''}</p>
            <p style="font-size: 12px; color: #777; margin-top: 10px; font-style: italic;">
              Confidentiality Notice: This email and any attachments are confidential and intended solely for the use of the individual to whom they are addressed.
            </p>
          </div>
        </div>
      </div>
    `;

    // Create the full email HTML structure
    return `<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml">
<head>
  <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Email Preview</title>
  <style type="text/css">
    body { 
      width: 100% !important; 
      -webkit-text-size-adjust: 100%; 
      -ms-text-size-adjust: 100%; 
      margin: 0; 
      padding: 0;
      font-family: Arial, sans-serif;
      line-height: 1.6;
      color: #333333;
      background-color: #f9f9f9;
    }
    
    .email-container {
      max-width: 600px;
      margin: 0 auto;
      background: #ffffff;
      padding: 20px;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    
    .email-content {
      line-height: 1.6;
    }
    
    .ExternalClass { 
      width: 100%; 
    }
    
    .ExternalClass, .ExternalClass p, .ExternalClass span, .ExternalClass font, .ExternalClass td, .ExternalClass div { 
      line-height: 100%; 
    }
    
    @media only screen and (max-width: 600px) {
      .email-container {
        width: 100% !important;
        padding: 15px !important;
      }
    }
  </style>
</head>
<body style="margin: 0; padding: 0; background-color: #f9f9f9;">
  <table border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #f9f9f9;">
    <tr>
      <td align="center">
        <table class="email-container" border="0" cellpadding="0" cellspacing="0" width="600" style="background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
          <tr>
            <td style="padding: 20px;">
              <div class="email-content">
                ${processedContent}
              </div>
            </td>
          </tr>
          <tr>
            <td>
              ${emailSignatureString}
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
  };

  const handleTemplateSelect = (e) => {
    const selectedTitle = e.target.value;
    const template = templates.find((t) => t.title === selectedTitle);
    if (template) {
      setSelectedTemplate(selectedTitle);
      setSelectedTemplateId(template.template_id);
      setSubject(template.subject);
      setTemplateTitle(template.title);

      const jsonContent = generateJSON(template.body, [
        StarterKit,
        Underline,
        BulletList,
        CodeBlock,
        Blockquote,
        TextAlign.configure({ types: ["heading", "paragraph"] }),
      ]);

      editor?.commands.setContent(jsonContent);
      setEmailContent(template.body);
    } else {
      // Clear if "Select a Template" is chosen
      setSelectedTemplate("");
      setSelectedTemplateId(null);
      setSubject("");
      setTemplateTitle("");
      editor?.commands.clearContent();
      setEmailContent("");
    }
  };

  const handleSaveTemplate = () => {
    if (!templateTitle) {
      alert("Please enter a title for the template.");
      return;
    }

    const data = {
      company_id: user.company_id,
      title: templateTitle,
      subject: subject,
      body: emailContent,
    };

    if (isEditingTemplate && selectedTemplateId) {
      api
        .put(`/email/templates/${selectedTemplateId}`, data)
        .then(() => {
          setShowTemplateModal(false);
          setIsEditingTemplate(false);
          setTemplateTitle("");
          fetchTemplates();
          addToast({ message: "Template updated successfully", recipient: "Template Manager" });
        })
        .catch(() => {
          addToast({ message: "Failed to update template", recipient: "Template Manager", error: true });
        });
    } else {
      api
        .post("/email/add/template", data)
        .then(() => {
          setShowTemplateModal(false);
          setTemplateTitle("");
          fetchTemplates();
          addToast({ message: "Template saved successfully", recipient: "Template Manager" });
        })
        .catch(() => {
          addToast({ message: "Failed to save template", recipient: "Template Manager", error: true });
        });
    }
  };

  const handleEditTemplate = () => {
    if (!selectedTemplateId) {
      addToast({ message: "Please select a template to edit", recipient: "Template Manager", error: true });
      return;
    }
    setIsEditingTemplate(true);
    setShowTemplateModal(true);
  };

  const handleDeleteTemplate = () => {
    if (!selectedTemplateId) {
      addToast({ message: "Please select a template to delete", recipient: "Template Manager", error: true });
      return;
    }
    setTemplateToDelete(selectedTemplateId);
    setShowDeleteModal(true);
  };

  const confirmDeleteTemplate = () => {
    api
      .delete(`/email/templates/${templateToDelete}`)
      .then(() => {
        setShowDeleteModal(false);
        setSelectedTemplate("");
        setSelectedTemplateId(null);
        setSubject("");
        setEmailContent("");
        editor?.commands.clearContent();
        fetchTemplates();
        addToast({ message: "Template deleted successfully", recipient: "Template Manager" });
      })
      .catch(() => {
        addToast({ message: "Failed to delete template", recipient: "Template Manager", error: true });
      });
  };

  const addToast = (toast) => {
    const id = Date.now();
    setToasts((prevToasts) => [...prevToasts, { ...toast, id }]);
  };

  const removeToast = (id) => {
    setToasts((prevToasts) => prevToasts.filter((toast) => toast.id !== id));
  };

  const handleSendEmail = () => {
    if (!subject.trim()) {
      addToast({ message: "Please enter an email subject", recipient: "Validation", error: true });
      return;
    }
    
    if (!emailContent.trim() || emailContent === '<p></p>') {
      addToast({ message: "Please enter email content", recipient: "Validation", error: true });
      return;
    }
    
    // Show preview first instead of confirmation modal
    setShowPreview(true);
  };

  const confirmSendEmail = () => {
    setShowPreview(false);
    setIsSendingEmail(true); // Start loading

    const formData = new FormData();
    formData.append("applicant_id", applicant.applicant_id);
    formData.append("user_id", user.user_id);
    formData.append("email_subject", subject);
    formData.append("email_body", emailContent);

    if (attachments.length > 0) {
      attachments.forEach((file) => formData.append("files", file));
    }

    api
      .post("/email/applicant", formData)
      .then(() => {
        setIsSendingEmail(false); // Stop loading
        addToast({ message: "Email has been sent successfully", recipient: applicant?.email });
        setEmailContent("");
        setSubject("");
        setAttachments([]);
        setSelectedTemplate("");
        setSelectedTemplateId(null);
        editor?.commands.clearContent();
      })
      .catch(() => {
        setIsSendingEmail(false); // Stop loading even on error
        addToast({ message: "Failed to send email", recipient: applicant?.email, error: true });
      });
  };

  const handleFileChange = (e) => {
    if (e.target.files) {
      setAttachments(Array.from(e.target.files));
    }
  };

  const handleRemoveFile = (fileName) => {
    setAttachments((prevAttachments) => prevAttachments.filter((file) => file.name !== fileName));
  };

  const clearAll = () => {
    setSubject("");
    setEmailContent("");
    setAttachments([]);
    setSelectedTemplate("");
    setSelectedTemplateId(null);
    editor?.commands.clearContent();
  };

  return (
    <div className="h-full mb-5">
      {/* Toast notifications */}
      <div className="fixed top-4 right-4 z-50 space-y-2">
        {toasts.map((toast) => (
          <SendMailToast key={toast.id} toast={toast} removeToast={removeToast} />
        ))}
      </div>

      {/* Loading Overlay when sending email */}
      {isSendingEmail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-2xl p-8 max-w-md mx-4">
            <Loader 
              type="dots" 
              size="lg" 
              text="Sending email..." 
              fullScreen={false}
              theme="teal"
            />
            <p className="text-center text-gray-600 mt-4 text-sm">
              Please wait while we send your email to {applicant?.first_name || 'the applicant'}...
            </p>
          </div>
        </div>
      )}

      {/* Email Preview Modal - Shows when user clicks Send Email */}
      {showPreview && (
        <div className="bg-black/50 fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-4xl h-full max-h-[90vh] bg-white rounded-xl shadow-2xl flex flex-col">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-800">
                Confirm & Send Email
              </h2>
              <button
                onClick={() => setShowPreview(false)}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                disabled={isSendingEmail}
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>
            
            <div className="flex-1 p-6 overflow-auto">
              <div className="mb-4 bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-blue-800 text-sm">
                  <strong>Review before sending:</strong> Please review the email below before sending it to {applicant?.first_name || 'the applicant'}.
                  The email signature is automatically included.
                </p>
              </div>
              
              <div className="mb-4 bg-white border border-gray-300 rounded-lg p-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="font-semibold text-gray-700">To:</p>
                    <p className="text-gray-600">
                      {applicant?.email_1} 
                      {applicant?.email_2 && <>, {applicant.email_2}</>} 
                      {applicant?.email_3 && <>, {applicant.email_3}</>}
                    </p>
                  </div>
                  <div>
                    <p className="font-semibold text-gray-700">Subject:</p>
                    <p className="text-gray-600">{subject || 'No subject'}</p>
                  </div>
                  <div className="md:col-span-2">
                    <p className="font-semibold text-gray-700">Attachments:</p>
                    <p className="text-gray-600">
                      {attachments.length > 0 
                        ? attachments.map(file => file.name).join(', ') 
                        : 'No attachments'}
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="border border-gray-300 rounded-lg overflow-hidden">
                <div className="bg-gray-100 px-4 py-2 border-b border-gray-300">
                  <p className="text-sm font-medium text-gray-700">Email Preview:</p>
                </div>
                <iframe
                  srcDoc={generateEmailPreview()}
                  className="w-full h-[500px] border-0"
                  title="Email Preview"
                  sandbox="allow-same-origin"
                />
              </div>
            </div>
            
            <div className="flex justify-between items-center p-6 border-t border-gray-200">
              <div className="text-sm text-gray-600">
                This email will be sent to {applicant?.first_name || 'the applicant'} immediately after confirmation.
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowPreview(false)}
                  className="px-6 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={isSendingEmail}
                >
                  Cancel
                </button>
                <button
                  onClick={confirmSendEmail}
                  disabled={isSendingEmail}
                  className="px-6 py-2 bg-teal-600 text-white hover:bg-teal-700 rounded-lg transition-colors font-medium flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSendingEmail ? (
                    <>
                      <Loader type="spinner" size="sm" className="!m-0" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                      </svg>
                      Send Email
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Template Confirmation Modal */}
      {showDeleteModal && (
        <ConfirmationModal
          title="Delete Template"
          message="Are you sure you want to delete this template? This action cannot be undone."
          confirmText="Delete"
          cancelText="Cancel"
          onConfirm={confirmDeleteTemplate}
          onCancel={() => setShowDeleteModal(false)}
          danger={true}
        />
      )}

      {/* Template Save/Edit Modal */}
      {showTemplateModal && (
        <div className="bg-black/50 fixed inset-0 z-50 flex items-center justify-center">
          <div className="w-full h-full flex items-center justify-center">
            <div
              role="dialog"
              aria-modal="true"
              className="rounded-lg bg-white p-6 shadow-lg max-w-md w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <h2 className="mb-4 text-lg font-semibold text-gray-800">
                {isEditingTemplate ? "Edit Template" : "Save as Template"}
              </h2>
              <p className="mb-4 text-sm text-gray-600">
                {isEditingTemplate ? "Update the template details below." : "Provide a title for the template."}
              </p>
              <input
                type="text"
                placeholder="Enter template title"
                value={templateTitle}
                onChange={(e) => setTemplateTitle(e.target.value)}
                className="w-full rounded-md border border-gray-300 p-2 text-gray-800 focus:outline-none focus:ring-2 focus:ring-teal-500 mb-4"
              />
              <div className="flex justify-end gap-4 mt-6">
                <button
                  onClick={() => {
                    setShowTemplateModal(false);
                    setIsEditingTemplate(false);
                    setTemplateTitle("");
                  }}
                  className="rounded-md bg-teal-600/10 px-4 py-2 text-teal-600 hover:bg-teal-600/20 hover:text-teal-700 text-sm"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveTemplate}
                  className="rounded-md bg-[#008080] px-4 py-2 text-white hover:bg-teal-700 text-sm"
                >
                  {isEditingTemplate ? "Update" : "Save"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Email Subject and Template Controls */}
      <div className="mb-5 flex flex-col md:flex-row gap-3">
        <div className="flex items-center gap-2">
          <select
            value={selectedTemplate}
            onChange={handleTemplateSelect}
            className="border border-teal text-teal body-regular bg-white p-2 rounded-lg hover:bg-gray-light cursor-pointer min-w-[200px]"
            disabled={isSendingEmail}
          >
            <option value="" disabled>
              Select a Template
            </option>
            {templates.map((template) => (
              <option key={template.template_id} value={template.title}>
                {template.title}
              </option>
            ))}
          </select>
          {selectedTemplate && (
            <>
              <button
                onClick={handleEditTemplate}
                className="p-2 text-teal hover:bg-teal/10 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                title="Edit Template"
                disabled={isSendingEmail}
              >
                <PencilSquareIcon className="h-5 w-5" />
              </button>
              <button
                onClick={handleDeleteTemplate}
                className="p-2 text-red-500 hover:bg-red-500/10 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                title="Delete Template"
                disabled={isSendingEmail}
              >
                <TrashIcon className="h-5 w-5" />
              </button>
            </>
          )}
        </div>
        <div className="flex-1 flex rounded-lg border border-gray-light">
          <span className="rounded-l-lg bg-teal px-4 py-2 text-white body-regular whitespace-nowrap">
            Subject
          </span>
          <input
            type="text"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            placeholder="Enter email subject"
            className="flex-1 rounded-r-lg bg-white body-regular text-gray-dark p-2 focus-visible:ring-0 focus-visible:ring-offset-0 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={isSendingEmail}
          />
        </div>
      </div>

      {/* Email Content */}
      <div className="mb-5 rounded-xl border border-gray-200 bg-white p-3">
        <div className="mb-4 flex flex-wrap gap-3 rounded-lg bg-white p-2 border border-gray-200">
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleBold().run()}
            className={`p-2 rounded ${editor?.isActive("bold") ? "bg-teal-100 text-teal-600" : "text-gray-600 hover:bg-gray-100"} disabled:opacity-50 disabled:cursor-not-allowed`}
            title="Bold"
            disabled={isSendingEmail}
          >
            <BoldIcon className="h-5 w-5" />
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleItalic().run()}
            className={`p-2 rounded ${editor?.isActive("italic") ? "bg-teal-100 text-teal-600" : "text-gray-600 hover:bg-gray-100"} disabled:opacity-50 disabled:cursor-not-allowed`}
            title="Italic"
            disabled={isSendingEmail}
          >
            <ItalicIcon className="h-5 w-5" />
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleUnderline().run()}
            className={`p-2 rounded ${editor?.isActive("underline") ? "bg-teal-100 text-teal-600" : "text-gray-600 hover:bg-gray-100"} disabled:opacity-50 disabled:cursor-not-allowed`}
            title="Underline"
            disabled={isSendingEmail}
          >
            <UnderlineIcon className="h-5 w-5" />
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            className={`p-2 rounded ${editor?.isActive("bulletList") ? "bg-teal-100 text-teal-600" : "text-gray-600 hover:bg-gray-100"} disabled:opacity-50 disabled:cursor-not-allowed`}
            title="Bullet List"
            disabled={isSendingEmail}
          >
            <ListBulletIcon className="h-5 w-5" />
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().setTextAlign("left").run()}
            className={`p-2 rounded ${editor?.isActive({ textAlign: 'left' }) ? "bg-teal-100 text-teal-600" : "text-gray-600 hover:bg-gray-100"} disabled:opacity-50 disabled:cursor-not-allowed`}
            title="Align Left"
            disabled={isSendingEmail}
          >
            <Bars3BottomLeftIcon className="h-5 w-5" />
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().setTextAlign("center").run()}
            className={`p-2 rounded ${editor?.isActive({ textAlign: 'center' }) ? "bg-teal-100 text-teal-600" : "text-gray-600 hover:bg-gray-100"} disabled:opacity-50 disabled:cursor-not-allowed`}
            title="Align Center"
            disabled={isSendingEmail}
          >
            <Bars3CenterLeftIcon className="h-5 w-5" />
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().setTextAlign("right").run()}
            className={`p-2 rounded ${editor?.isActive({ textAlign: 'right' }) ? "bg-teal-100 text-teal-600" : "text-gray-600 hover:bg-gray-100"} disabled:opacity-50 disabled:cursor-not-allowed`}
            title="Align Right"
            disabled={isSendingEmail}
          >
            <Bars3BottomRightIcon className="h-5 w-5" />
          </button>
        </div>
        <EditorContent
          editor={editor}
          className="min-h-[300px] prose prose-sm sm:prose-base max-w-none
            [&_.ProseMirror]:min-h-[300px]
            [&_ul]:list-disc [&_ul]:pl-6
            [&_ol]:list-decimal [&_ol]:pl-6
            [&_blockquote]:border-l-4 [&_blockquote]:border-teal-500 [&_blockquote]:pl-4 [&_blockquote]:italic
            [&_pre]:bg-gray-100 [&_pre]:p-4 [&_pre]:rounded [&_pre]:overflow-x-auto
            [&_code]:bg-gray-100 [&_code]:px-2 [&_code]:py-1 [&_code]:rounded [&_code]:text-sm"
        />
      </div>

      {/* Attachments */}
      <div className="mb-5 flex flex-col sm:flex-row border border-gray-light body-regular bg-white overflow-hidden rounded-lg">
        <label
          htmlFor="file-upload"
          className={`cursor-pointer bg-teal px-4 py-2 text-white whitespace-nowrap ${isSendingEmail ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          Attachments
          <input
            id="file-upload"
            type="file"
            className="hidden"
            onChange={handleFileChange}
            multiple
            disabled={isSendingEmail}
          />
        </label>
        <div className="flex-1 p-2 min-h-[44px] flex items-center">
          {attachments.length > 0 ? (
            <div className="flex flex-wrap items-center gap-2">
              {attachments.map((file) => (
                <div key={file.name} className="flex items-center gap-2 bg-gray-100 px-3 py-1 rounded-lg border">
                  <span className="text-gray-700 text-sm">{file.name}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveFile(file.name)}
                    className="text-gray-500 hover:text-red-500 hover:bg-red-50 p-1 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    title="Remove file"
                    disabled={isSendingEmail}
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <span className="text-gray-500">No files selected</span>
          )}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 body-regular">
        <div className="flex items-center gap-4">
          <button
            onClick={() => {
              setIsEditingTemplate(false);
              setShowTemplateModal(true);
            }}
            className="border border-teal text-teal body-regular bg-white px-4 py-2 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={isSendingEmail}
          >
            Save as Template
          </button>
          <button
            onClick={clearAll}
            className="border border-gray-500 text-gray-700 body-regular bg-white px-4 py-2 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={isSendingEmail}
          >
            Clear All
          </button>
        </div>
        <button
          onClick={handleSendEmail}
          disabled={!subject.trim() || !emailContent.trim() || emailContent === '<p></p>' || isSendingEmail}
          className="rounded-lg bg-teal px-6 py-2 text-white hover:bg-teal-600 cursor-pointer transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center gap-2"
        >
          {isSendingEmail ? (
            <>
              <Loader type="spinner" size="sm" className="!m-0" />
              Sending...
            </>
          ) : (
            <>
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
              Send Email
            </>
          )}
        </button>
      </div>
    </div>
  );
}

export default ApplicantSendMailPage;