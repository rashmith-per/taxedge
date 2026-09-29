import { create } from 'zustand';
import type { CompanyRegistrationDraft, LinkedRegistrations, ApplicationReceipt, CompanyDoc } from '../types/registration.types';
import type { CompanyType, CompanyDetails } from '../types/company.types';
import type { DirectorInfo, OpcNomineeInfo, PartnerInfo } from '../types/director.types';
import type { DocumentStatus, Application } from '../../../types/domain';
import { useApplicationStore } from '../../../store/applicationStore';
import { getSuffixForType } from '../validation/companySchema';

interface CompanyRegistrationState {
  draft: CompanyRegistrationDraft;
  fieldErrors: Record<string, string>;
  setFieldErrors: (errors: Record<string, string>) => void;
  clearFieldError: (key: string) => void;
  clearAllFieldErrors: () => void;
  setCompanyType: (type: CompanyType) => void;
  updateCompanyDetails: (details: Partial<CompanyDetails>) => void;
  addDirector: (director: DirectorInfo) => void;
  updateDirector: (id: string, director: Partial<DirectorInfo>) => void;
  removeDirector: (id: string) => void;
  addPartner: (partner: PartnerInfo) => void;
  removePartner: (id: string) => void;
  setOpcNominee: (nominee: OpcNomineeInfo) => void;
  toggleLinkedRegistration: (key: keyof LinkedRegistrations) => void;
  updateDocumentStatus: (documentId: string, status: DocumentStatus, fileUri?: string, fileName?: string) => void;
  setStep: (step: number) => void;
  processPayment: (paymentMethod: string) => void;
  resetRegistration: () => void;
}

const removeErrorKeys = (errors: Record<string, string>, keysToRemove: string[]): Record<string, string> =>
  Object.fromEntries(Object.entries(errors).filter(([key]) => !keysToRemove.includes(key)));

const createInitialDraft = (): CompanyRegistrationDraft => ({
  id: '',
  company: {
    companyType: '' as CompanyType,
    companyClass: '' as any,
    companyCategory: '' as any,
    companySubCategory: '' as any,
    primaryActivity: '',
    nicCode: '',
    secondaryActivity: '',
    proposedName1: '',
    proposedName2: '',
    proposedName3: '',
    nameSuffix: '',
    nameAvailabilityStatus: 'Available',
    registeredAddressLine: '',
    registeredCity: '',
    registeredDistrict: '',
    registeredState: '',
    registeredPincode: '',
    premisesOwnership: '' as any,
    companyEmail: '',
    companyMobile: '',
    officeAddressProofName: '',
    officeAddressProofUri: '',
    ownershipDocName: '',
    ownershipDocUri: '',
    ownerNocName: '',
    ownerNocUri: '',
    authorizedCapital: 0,
    paidUpCapital: 0,
    numberOfShares: 0,
    faceValuePerShare: 0,
  },
  directors: [],
  opcNominee: {
    name: '',
    pan: '',
    aadhaar: '',
    email: '',
    phone: '',
    relationship: '',
  },
  partners: [],
  documents: [
    { id: 'doc-pan', name: 'Promoter PAN Card', category: 'Promoter KYC', required: true, status: 'Pending' },
    { id: 'doc-aadhaar', name: 'Promoter Aadhaar / Passport', category: 'Promoter KYC', required: true, status: 'Pending' },
    { id: 'doc-photo', name: 'Promoter Passport Photo', category: 'Promoter KYC', required: false, status: 'Pending' },
    { id: 'doc-address', name: 'Registered Office Ownership / Lease Proof', category: 'Office Proof', required: true, status: 'Pending' },
    { id: 'doc-utility', name: 'Registered Office Utility Bill (Electricity/Water)', category: 'Office Proof', required: true, status: 'Pending' },
    { id: 'doc-noc', name: 'Property Owner No Objection Certificate (NOC)', category: 'Office Proof', required: false, status: 'Pending' },
    { id: 'doc-moa', name: 'Draft e-MoA (Memorandum of Association)', category: 'Statutory Docs', required: false, status: 'Pending' },
    { id: 'doc-aoa', name: 'Draft e-AoA (Articles of Association)', category: 'Statutory Docs', required: false, status: 'Pending' },
  ],
  linkedRegistrations: {
    pan: false,
    tan: false,
    gst: false,
    esic: false,
    epfo: false,
    professionalTax: false,
    bankAccount: false,
  },
  feeBreakdown: {
    professionalFee: 4999,
    gstAmount: 900,
    statutoryCharges: 1500,
    totalAmount: 7399,
  },
  trackingStages: [
    { id: 'stg-1', title: 'Draft Creation', description: 'Application initiated by user', status: 'pending' },
    { id: 'stg-2', title: 'KYC & Document Verification', description: 'Reviewing PAN, Aadhaar & Office Proofs', status: 'pending' },
    { id: 'stg-3', title: 'Under Review', description: 'TaxEdge compliance expert validation', status: 'pending' },
    { id: 'stg-4', title: 'Name Reservation (RUN / SPICe+ Part A)', description: 'Filing preferred names with MCA CRC', status: 'pending' },
    { id: 'stg-5', title: 'DSC & DIN Processing', description: 'Digital signature token generation', status: 'pending' },
    { id: 'stg-6', title: 'Ready for SPICe+ Part B Filing', description: 'Final incorporation payload compilation', status: 'pending' },
    { id: 'stg-7', title: 'Submitted to MCA Portal', description: 'Form e-MoA, e-AoA & AGILE-PRO-S filed', status: 'pending' },
    { id: 'stg-8', title: 'Government Approval & COI', description: 'Certificate of Incorporation & CIN Issuance', status: 'pending' },
  ],
  currentStep: 0,
  totalFee: 4999,
  paymentStatus: 'Pending',
  status: 'Draft',
  createdAt: '',
});

const createReceipt = (draft: CompanyRegistrationDraft, paymentMethod: string): ApplicationReceipt => ({
  applicationId: draft.id,
  companyName: draft.company.proposedName1,
  companyType: draft.company.companyType,
  appliedDate: new Date().toISOString().split('T')[0],
  totalAmount: draft.feeBreakdown.totalAmount,
  paymentStatus: 'Paid',
  paymentMethod,
  transactionId: `TXN-${Math.floor(10000000 + Math.random() * 90000000)}`,
});

const createApplicationObject = (draft: CompanyRegistrationDraft): Application => ({
  id: draft.id,
  serviceId: 'company-registration',
  serviceName: 'Company Registration',
  category: 'BUSINESS',
  status: 'Under Verification',
  progress: 100,
  assignedExecutive: 'TaxEdge Compliance Team',
  paymentAmount: draft.feeBreakdown.totalAmount,
  paymentStatus: 'Paid',
  createdAt: new Date().toISOString().split('T')[0],
  formData: {
    companyType: draft.company.companyType,
    proposedName: draft.company.proposedName1,
  },
  documents: draft.documents.map((d) => ({ name: d.name, status: d.status, fileUri: d.fileUri })),
  timeline: (draft.trackingStages || []).map((stg) => ({
    title: stg.title,
    description: stg.description,
    status: stg.status,
    date: stg.updatedAt || 'Today',
  })),
  chatHistory: [],
});

export const useCompanyRegistrationStore = create<CompanyRegistrationState>((set) => ({
  draft: createInitialDraft(),
  fieldErrors: {},
  setFieldErrors: (fieldErrors) => set({ fieldErrors }),
  clearFieldError: (key) => set((state) => ({ fieldErrors: removeErrorKeys(state.fieldErrors, [key]) })),
  clearAllFieldErrors: () => set({ fieldErrors: {} }),
  setCompanyType: (type) =>
    set((state) => {
      const isOpc = type === 'One Person Company (OPC)';
      const directors = isOpc && state.draft.directors.length > 0
        ? [{ ...state.draft.directors[0], sharesPercentage: 100 }]
        : state.draft.directors;
      return {
        fieldErrors: removeErrorKeys(state.fieldErrors, ['companyType', 'nameSuffix']),
        draft: {
          ...state.draft,
          company: { ...state.draft.company, companyType: type, nameSuffix: getSuffixForType(type) },
          directors,
        },
      };
    }),
  updateCompanyDetails: (details) =>
    set((state) => ({
      fieldErrors: removeErrorKeys(state.fieldErrors, Object.keys(details)),
      draft: {
        ...state.draft,
        company: { ...state.draft.company, ...details },
      },
    })),
  addDirector: (director) =>
    set((state) => {
      if (state.draft.company.companyType === 'One Person Company (OPC)') return state;
      return {
        fieldErrors: removeErrorKeys(state.fieldErrors, ['directorsCount']),
        draft: {
          ...state.draft,
          directors: [...state.draft.directors, director],
        },
      };
    }),
  updateDirector: (id, updatedFields) =>
    set((state) => ({
      fieldErrors: removeErrorKeys(
        state.fieldErrors,
        Object.keys(updatedFields).flatMap((k) => [`dir_${id}_${k}`, k])
      ),
      draft: {
        ...state.draft,
        directors: state.draft.directors.map((d) => (d.id === id ? { ...d, ...updatedFields } : d)),
      },
    })),
  removeDirector: (id) =>
    set((state) => ({
      draft: {
        ...state.draft,
        directors: state.draft.directors.filter((d) => d.id !== id),
      },
    })),
  addPartner: (partner) =>
    set((state) => ({
      draft: {
        ...state.draft,
        partners: [...state.draft.partners, partner],
      },
    })),
  removePartner: (id) =>
    set((state) => ({
      draft: {
        ...state.draft,
        partners: state.draft.partners.filter((p) => p.id !== id),
      },
    })),
  setOpcNominee: (opcNominee) =>
    set((state) => ({
      draft: { ...state.draft, opcNominee },
    })),
  toggleLinkedRegistration: (key) =>
    set((state) => ({
      draft: {
        ...state.draft,
        linkedRegistrations: {
          ...state.draft.linkedRegistrations,
          [key]: !state.draft.linkedRegistrations[key],
        },
      },
    })),
  updateDocumentStatus: (documentId, status, fileUri, fileName) =>
    set((state) => {
      const exists = state.draft.documents.some((doc) => doc.id === documentId);
      const updatedDocs = exists
        ? state.draft.documents.map((doc) => (doc.id === documentId ? { ...doc, status, fileUri, fileName } : doc))
        : [...state.draft.documents, { id: documentId, name: documentId, category: 'Conditional Doc', required: true, status, fileUri, fileName }];
      return {
        fieldErrors: removeErrorKeys(state.fieldErrors, [documentId, 'documentsChecklist']),
        draft: { ...state.draft, documents: updatedDocs },
      };
    }),
  setStep: (currentStep) => set((state) => ({ draft: { ...state.draft, currentStep } })),
  processPayment: (paymentMethod) =>
    set((state) => {
      const receipt = createReceipt(state.draft, paymentMethod);
      const app = createApplicationObject(state.draft);
      useApplicationStore.getState().addApplication(app);
      return {
        draft: { ...state.draft, paymentStatus: 'Paid', status: 'Submitted', receipt },
      };
    }),
  resetRegistration: () => set({ draft: createInitialDraft(), fieldErrors: {} }),
}));
