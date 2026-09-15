import { LegalDocumentView } from '@/components/LegalDocumentView';
import { termsOfUseUrl } from '@/constants/config';
import { termsOfUse } from '@/content/legal';

export default function TermsOfUseScreen() {
  return <LegalDocumentView document={termsOfUse} hostedUrl={termsOfUseUrl()} />;
}
