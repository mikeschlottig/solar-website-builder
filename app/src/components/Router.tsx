import { Routes, Route } from "react-router-dom";
import { SignedIn, SignedOut } from "@/auth/AuthProvider";
import LandingPage from "./pages/LandingPage";
import Dashboard from "./pages/Dashboard";
import WebsiteEditor from "./pages/WebsiteEditor";
import PageEditor from "./pages/PageEditor";
import ComponentEditor from "./pages/ComponentEditor";
import MediaLibrary from "./pages/MediaLibrary";

export default function Router() {
  return (
    <>
      <SignedOut>
        <Routes>
          <Route path="*" element={<LandingPage />} />
        </Routes>
      </SignedOut>
      <SignedIn>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/website/:websiteId" element={<WebsiteEditor />} />
          <Route path="/website/:websiteId/page/:pageId" element={<PageEditor />} />
          <Route path="/components" element={<ComponentEditor />} />
          <Route path="/media" element={<MediaLibrary />} />
          <Route path="*" element={<Dashboard />} />
        </Routes>
      </SignedIn>
    </>
  );
}
