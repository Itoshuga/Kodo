import { Routes, Route } from 'react-router-dom';
import { HomePage } from '../pages/HomePage';
import { TripsPage } from '../pages/TripsPage';
import { TripDetailPage } from '../pages/TripDetailPage';
import { CreateTripPage } from '../pages/CreateTripPage';
import { EditTripPage } from '../pages/EditTripPage';
import { AddStepPage } from '../pages/AddStepPage';
import { StepDetailPage } from '../pages/StepDetailPage';
import { EditStepPage } from '../pages/EditStepPage';
import { InvitationsPage } from '../pages/InvitationsPage';
import { ProfilePage } from '../pages/ProfilePage';
import { SettingsPage } from '../pages/SettingsPage';

export function AppRouter() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/trips" element={<TripsPage />} />
      <Route path="/trips/new" element={<CreateTripPage />} />
      <Route path="/trips/:id" element={<TripDetailPage />} />
      <Route path="/trips/:id/edit" element={<EditTripPage />} />
      <Route path="/trips/:id/steps/new" element={<AddStepPage />} />
      <Route path="/trips/:id/steps/:stepId" element={<StepDetailPage />} />
      <Route path="/trips/:id/steps/:stepId/edit" element={<EditStepPage />} />
      <Route path="/invitations" element={<InvitationsPage />} />
      <Route path="/profile" element={<ProfilePage />} />
      <Route path="/settings" element={<SettingsPage />} />
    </Routes>
  );
}
