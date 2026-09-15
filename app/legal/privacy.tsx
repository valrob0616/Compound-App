import { LegalDocumentView } from '@/components/LegalDocumentView';
import { privacyPolicyUrl } from '@/constants/config';
import { privacyPolicy } from '@/content/legal';

export default function PrivacyPolicyScreen() {
  return <LegalDocumentView document={privacyPolicy} hostedUrl={privacyPolicyUrl()} />;
}
