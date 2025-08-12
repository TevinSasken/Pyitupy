import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import Dashboard from "./pages/Dashboard";
import UploadIndividual from "./pages/UploadIndividual";
import UploadBusiness from "./pages/UploadBusiness";
import Scores from "./pages/Scores";
import Marketplace from "./pages/Marketplace";
import LoanApplication from "./pages/LoanApplication";
import UnderReview from "./pages/UnderReview";
import LoanFunding from "./pages/LoanFunding";
import FundingConfirmation from "./pages/FundingConfirmation";
import ConnectWallet from "./pages/ConnectWallet";


export default function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/upload-individual" element={<UploadIndividual />} />
          <Route path="/upload-business" element={<UploadBusiness />} />
          <Route path="/scores" element={<Scores />} />
          <Route path="/marketplace" element={<Marketplace />} />
          <Route path="/loan-application" element={<LoanApplication />} />
          <Route path="/under-review" element={<UnderReview />} />
          <Route path="/fund-loan/:loanId" element={<LoanFunding />} />
          <Route path="/funding-confirmation" element={<FundingConfirmation />} />
          <Route path="/connect-wallet/:loanId" element={<ConnectWallet/>}/>
        </Routes>
      </Layout>
    </Router>
  );
}
