import { useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { X, ArrowRight, MapPin, Calendar, Sparkles } from 'lucide-react';
import { PageLayout } from '../components/layout/PageLayout';
import { FormStepper } from '../components/ui/FormStepper';
import { useTripsStore } from '../store/tripsStore';

const TOTAL_STEPS = 2;

export function EditTripPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const trips = useTripsStore((s) => s.trips);
  const updateTrip = useTripsStore((s) => s.updateTrip);
  const trip = trips.find((t) => t.id === id);

  const [step, setStep] = useState(0);
  const [title, setTitle] = useState(trip?.title ?? '');
  const [description, setDescription] = useState(trip?.description ?? '');
  const [date, setDate] = useState(trip?.date ?? '');

  if (!trip) {
    return (
      <PageLayout>
        <div className="page-container pt-20 text-center">
          <p className="text-stone-500">Trajet introuvable.</p>
          <Link to="/trips" className="mt-4 inline-block text-sm font-semibold text-teal-700 underline">
            Retour
          </Link>
        </div>
      </PageLayout>
    );
  }

  const canContinue = title.trim().length > 0;

  async function handleSubmit() {
    if (!title.trim()) return;
    await updateTrip({
      ...trip!,
      title: title.trim(),
      description: description.trim() || undefined,
      date: date || undefined,
    });
    navigate(`/trips/${trip!.id}`);
  }

  function goBack() {
    if (step === 0) navigate(`/trips/${trip!.id}`);
    else setStep(step - 1);
  }

  return (
    <PageLayout>
      <div className="flex min-h-screen flex-col lg:ml-72">
        <div className="flex items-center justify-between px-4 pt-4">
          <button
            type="button"
            onClick={goBack}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-stone-100 text-stone-500 transition-colors hover:bg-stone-200"
            aria-label={step === 0 ? 'Fermer' : 'Retour'}
          >
            {step === 0 ? <X className="h-5 w-5" /> : <ArrowRight className="h-5 w-5 rotate-180" />}
          </button>
          <FormStepper total={TOTAL_STEPS} current={step} />
        </div>

        <div className="flex flex-1 flex-col px-6 pb-24 pt-8 lg:mx-auto lg:w-full lg:max-w-xl lg:pt-12">
          {step === 0 && (
            <div className="flex flex-1 flex-col">
              <div className="mb-10">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl gradient-hero">
                  <MapPin className="h-6 w-6 text-white" />
                </div>
                <h1 className="font-brand text-3xl font-bold tracking-tight text-stone-800 lg:text-4xl">
                  Modifier le trajet
                </h1>
                <p className="mt-3 text-base leading-relaxed text-stone-500">
                  Renommez ou ajustez les informations de votre trajet.
                </p>
              </div>

              <div className="relative mb-8">
                <input
                  type="text"
                  autoFocus
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Tokyo vers Kyoto"
                  className="input-floating text-xl"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && canContinue) {
                      e.preventDefault();
                      setStep(1);
                    }
                  }}
                />
                <label className="pointer-events-none absolute left-0 top-0 text-xs font-semibold uppercase tracking-wider text-stone-400">
                  Nom du trajet
                </label>
              </div>

              <div className="mt-auto">
                <button
                  type="button"
                  disabled={!canContinue}
                  onClick={() => setStep(1)}
                  className="btn-primary w-full py-4 text-base"
                >
                  Continuer
                  <ArrowRight className="h-5 w-5" />
                </button>
              </div>
            </div>
          )}

          {step === 1 && (
            <div className="flex flex-1 flex-col">
              <div className="mb-10">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-stone-100">
                  <Sparkles className="h-6 w-6 text-stone-600" />
                </div>
                <h1 className="font-brand text-3xl font-bold tracking-tight text-stone-800 lg:text-4xl">
                  Details du trajet
                </h1>
                <p className="mt-3 text-base leading-relaxed text-stone-500">
                  Ajustez la date et les notes si necessaire.
                </p>
              </div>

              <div className="space-y-8">
                <div className="relative">
                  <div className="flex items-center gap-3 border-b-2 border-stone-200 pb-3 transition-colors focus-within:border-teal-600">
                    <Calendar className="h-5 w-5 flex-shrink-0 text-stone-400" />
                    <div className="flex-1">
                      <label htmlFor="date" className="mb-1 block text-xs font-semibold uppercase tracking-wider text-stone-400">
                        Date du trajet
                      </label>
                      <input
                        id="date"
                        type="date"
                        value={date}
                        onChange={(e) => setDate(e.target.value)}
                        className="w-full border-0 bg-transparent p-0 text-base font-medium text-stone-800 outline-none"
                      />
                    </div>
                  </div>
                </div>

                <div className="relative">
                  <label htmlFor="description" className="mb-2 block text-xs font-semibold uppercase tracking-wider text-stone-400">
                    Notes
                  </label>
                  <textarea
                    id="description"
                    rows={3}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Premier jour, depart tot le matin..."
                    className="w-full resize-none rounded-2xl border-2 border-stone-200 bg-stone-50/50 px-4 py-3 text-base font-medium text-stone-800 placeholder:text-stone-300 transition-colors focus:border-teal-600 focus:bg-white focus:outline-none"
                  />
                </div>
              </div>

              <div className="mt-auto flex gap-3 pt-10">
                <button
                  type="button"
                  onClick={() => setStep(0)}
                  className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl border-2 border-stone-200 text-stone-500 transition-colors hover:border-stone-300 hover:text-stone-700"
                >
                  <ArrowRight className="h-5 w-5 rotate-180" />
                </button>
                <button
                  type="button"
                  onClick={handleSubmit}
                  className="btn-primary flex-1 py-4 text-base"
                >
                  Enregistrer
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </PageLayout>
  );
}
