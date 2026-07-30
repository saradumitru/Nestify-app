import { Routes, Route, useLocation } from "react-router-dom";
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import ForgotPasswordPage from "./pages/ForgotPasswordPage";
import ResetPasswordPage from "./pages/ResetPasswordPage";
import StyleDetailsPage from "./pages/StyleDetailsPage";
import InteriorDetailsPage from "./pages/InteriorDetailsPage";
import MovieHouseDetailsPage from "./pages/MovieHouseDetailsPage";
import MovieHousesPage from "./pages/MovieHousesPage";
import SearchPage from "./pages/SearchPage";
import AdminPage from "./pages/AdminPage";
import FavoritesPage from "./pages/FavoritesPage";
import MoodboardsPage from "./pages/MoodboardsPage";
import MoodboardDetailsPage from "./pages/MoodboardDetailsPage";
import QuizPage from "./pages/QuizPage";
import BudgetEstimatorPage from "./pages/BudgetEstimatorPage";
import AssistantPage from "./pages/AssistantPage";
import AIAssistant from "./components/AIAssistant";
import ProfilePage from "./pages/ProfilePage";
import PublicMoodboardPage from "./pages/PublicMoodboardPage";
import ProtectedRoute from "./components/ProtectedRoute";
import { Toaster } from "react-hot-toast";
import ProjectsPage from "./pages/ProjectsPage";
import DiscoverPage from "./pages/DiscoverPage";
import ComparePage from "./pages/ComparePage";
import PalettePage from "./pages/PalettePage";
import TimelinePage from "./pages/TimelinePage";
import RoomDetectorPage from "./pages/RoomDetectorPage";
import DesignersPage from "./pages/DesignersPage";
import DesignerProfilePage from "./pages/DesignerProfilePage";
import MyDesignerProfilePage from "./pages/MyDesignerProfilePage";
import StoriesPage from "./pages/StoriesPage";
import StoryDetailPage from "./pages/StoryDetailPage";
import RoomPage from "./pages/RoomPage";

function App() {
  const location = useLocation();
  const hideFloatingAssistant = ["/assistant", "/room-detector"].includes(location.pathname);

  return (
    <>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />
        <Route path="/styles/:slug" element={<StyleDetailsPage />} />
        <Route path="/styles/:slug/interiors/:interiorSlug" element={<InteriorDetailsPage />} />
        <Route path="/movie-houses" element={<MovieHousesPage />} />
        <Route path="/movie-houses/:slug" element={<MovieHouseDetailsPage />} />
        <Route path="/search" element={<SearchPage />} />
        <Route path="/discover" element={<DiscoverPage />} />
        <Route path="/compare" element={<ComparePage />} />
        <Route path="/palette" element={<PalettePage />} />
        <Route path="/timeline" element={<TimelinePage />} />
        <Route path="/room-detector" element={<RoomDetectorPage />} />
        <Route path="/budget-estimator" element={<BudgetEstimatorPage />} />
        <Route path="/quiz" element={<QuizPage />} />
        <Route path="/assistant" element={<AssistantPage />} />
        <Route path="/moodboards/public/:shareId" element={<PublicMoodboardPage />} />
        <Route path="/designers" element={<DesignersPage />} />
        <Route path="/designers/:id" element={<DesignerProfilePage />} />
        <Route
          path="/admin"
          element={
            <ProtectedRoute requiredRole="ADMIN">
              <AdminPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/favorites"
          element={
            <ProtectedRoute>
              <FavoritesPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/moodboards"
          element={
            <ProtectedRoute>
              <MoodboardsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/moodboards/:id"
          element={
            <ProtectedRoute>
              <MoodboardDetailsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <ProfilePage />
            </ProtectedRoute>
          }
        />
        <Route path="/projects" element={<ProjectsPage />} />
        <Route path="/stories" element={<StoriesPage />} />
        <Route path="/stories/:id" element={<StoryDetailPage />} />
        <Route path="/rooms/:roomType" element={<RoomPage />} />
        <Route
          path="/designer/profile"
          element={
            <ProtectedRoute requiredRole="DESIGNER">
              <MyDesignerProfilePage />
            </ProtectedRoute>
          }
        />
      </Routes>

      {!hideFloatingAssistant && <AIAssistant />}
      <Toaster position="top-right" />
    </>
  );
}

export default App;
