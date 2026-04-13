import { useState } from 'react';
import { useNavigate, useParams, Link, useSearchParams } from 'react-router-dom';
import { X, ArrowRight, Check } from 'lucide-react';
import { PageLayout } from '../components/layout/PageLayout';
import { FormStepper } from '../components/ui/FormStepper';
import { TransportIcon } from '../components/trips/TransportIcon';
import { useTripsStore } from '../store/tripsStore';
import { getAllTransportTypes, getStepTypeConfig, getTransportMeta } from '../utils/transport';
import { generateId } from '../utils/ids';
import { getTripDayOptions } from '../utils/tripSchedule';
import type { TransportType } from '../types/trip';

const TOTAL_STEPS = 3;

export function AddStepPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const trips = useTripsStore((s) => s.trips);
  const addStep = useTripsStore((s) => s.addStep);
  const trip = trips.find((t) => t.id === id);
  const prefilledDay = Number.parseInt(searchParams.get('day') ?? '', 10);
  const initialDayIndex = Number.isFinite(prefilledDay) && prefilledDay >= 0 ? prefilledDay : 0;

  const [step, setStep] = useState(0);
  const [type, setType] = useState<TransportType>('walk');
  const [dayIndex, setDayIndex] = useState(initialDayIndex);
  const [title, setTitle] = useState('');
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [departureTime, setDepartureTime] = useState('');
  const [arrivalTime, setArrivalTime] = useState('');
  const [estimatedDuration, setEstimatedDuration] = useState('');
  const [lineName, setLineName] = useState('');
  const [platform, setPlatform] = useState('');
  const [link, setLink] = useState('');
  const [note, setNote] = useState('');

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

  const transportTypes = getAllTransportTypes();
  const selectedMeta = getTransportMeta(type);
  const typeConfig = getStepTypeConfig(type);
  const baseDayOptions = getTripDayOptions(trip);
  const dayOptions = [...baseDayOptions];

  for (let i = baseDayOptions.length; i <= dayIndex; i += 1) {
    dayOptions.push({
      index: i,
      shortLabel: `Jour ${i + 1}`,
      label: `Jour ${i + 1}`,
    });
  }

  const titleOk = title.trim().length > 0;
  const fromOk = !typeConfig.requiresFrom || from.trim().length > 0;
  const toOk = !typeConfig.requiresTo || to.trim().length > 0;
  const canGoStep2 = titleOk && fromOk && toOk;

  function normalizeStepLink(value: string) {
    const trimmed = value.trim();
    if (!trimmed) return undefined;
    if (/^[a-z][a-z0-9+.-]*:/i.test(trimmed)) return trimmed;
    return `https://${trimmed}`;
  }

  async function handleSubmit() {
    if (!canGoStep2) return;

    await addStep(trip.id, {
      id: generateId(),
      order: trip.steps.length,
      dayIndex,
      type,
      title: title.trim(),
      from: typeConfig.requiresFrom ? from.trim() : from.trim() || undefined,
      to: typeConfig.requiresTo ? to.trim() : to.trim() || undefined,
      departureTime: departureTime || undefined,
      arrivalTime: arrivalTime || undefined,
      estimatedDuration: estimatedDuration ? parseInt(estimatedDuration, 10) : undefined,
      lineName: typeConfig.showLinePlatform ? lineName.trim() || undefined : undefined,
      platform: typeConfig.showLinePlatform ? platform.trim() || undefined : undefined,
      link: normalizeStepLink(link),
      note: note.trim() || undefined,
    });
    navigate(`/trips/${trip.id}`);
  }

  function goBack() {
    if (step === 0) navigate(`/trips/${trip.id}`);
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
              <div className="mb-8">
                <h1 className="font-brand text-3xl font-bold tracking-tight text-stone-800 lg:text-4xl">
                  Quel type d’étape ?
                </h1>
                <p className="mt-3 text-base leading-relaxed text-stone-500">
                  Transport, attente, correspondance ou lieu de visite.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {transportTypes.map((t) => {
                  const meta = getTransportMeta(t);
                  const selected = type === t;
                  return (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setType(t)}
                      className={`relative flex flex-col items-center gap-3 rounded-2xl px-4 py-5 transition-all duration-200 ${
                        selected
                          ? 'bg-white shadow-lg ring-2 ring-teal-600'
                          : 'bg-white shadow-sm ring-1 ring-stone-200/80 hover:shadow-md hover:ring-stone-300'
                      }`}
                    >
                      {selected && (
                        <div className="absolute right-2.5 top-2.5 flex h-5 w-5 items-center justify-center rounded-full bg-teal-600">
                          <Check className="h-3 w-3 text-white" />
                        </div>
                      )}
                      <div
                        className="flex h-12 w-12 items-center justify-center rounded-2xl transition-colors"
                        style={{ backgroundColor: `${meta.color}14` }}
                      >
                        <TransportIcon type={t} size={24} />
                      </div>
                      <span className={`text-sm font-semibold ${selected ? 'text-teal-700' : 'text-stone-700'}`}>
                        {meta.label}
                      </span>
                    </button>
                  );
                })}
              </div>

              <div className="mt-auto pt-8">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="btn-primary form-nav-primary-btn w-full"
                >
                  Continuer
                  <ArrowRight className="h-5 w-5" />
                </button>
              </div>
            </div>
          )}

          {step === 1 && (
            <div className="flex flex-1 flex-col">
              <div className="mb-8">
                <div
                  className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl"
                  style={{ backgroundColor: `${selectedMeta.color}14` }}
                >
                  <TransportIcon type={type} size={20} />
                </div>
                <h1 className="font-brand text-3xl font-bold tracking-tight text-stone-800 lg:text-4xl">
                  Décrivez l’étape
                </h1>
              </div>

              <div className="space-y-5">
                <div>
                  <label htmlFor="dayIndex" className="mb-2 block text-xs font-semibold uppercase tracking-wider text-stone-400">
                    Jour de l’itinéraire
                  </label>
                  <select
                    id="dayIndex"
                    value={dayIndex}
                    onChange={(e) => setDayIndex(parseInt(e.target.value, 10))}
                    className="input-field text-sm font-medium"
                  >
                    {dayOptions.map((option) => (
                      <option key={option.index} value={option.index}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="relative">
                  <label className="pointer-events-none absolute left-0 top-0 text-xs font-semibold uppercase tracking-wider text-stone-400">
                    Titre
                  </label>
                  <input
                    type="text"
                    autoFocus
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder={typeConfig.titlePlaceholder}
                    className="input-floating"
                  />
                </div>

                {typeConfig.requiresFrom && (
                  <div className="relative">
                    <label className="pointer-events-none absolute left-0 top-0 text-xs font-semibold uppercase tracking-wider text-stone-400">
                      {typeConfig.fromLabel}
                    </label>
                    <input
                      type="text"
                      value={from}
                      onChange={(e) => setFrom(e.target.value)}
                      placeholder={typeConfig.fromPlaceholder}
                      className="input-floating"
                    />
                  </div>
                )}

                {typeConfig.requiresTo && (
                  <div className="relative">
                    <label className="pointer-events-none absolute left-0 top-0 text-xs font-semibold uppercase tracking-wider text-stone-400">
                      {typeConfig.toLabel}
                    </label>
                    <input
                      type="text"
                      value={to}
                      onChange={(e) => setTo(e.target.value)}
                      placeholder={typeConfig.toPlaceholder}
                      className="input-floating"
                    />
                  </div>
                )}
              </div>

              <div className="mt-auto flex gap-3 pt-8">
                <button
                  type="button"
                  onClick={() => setStep(0)}
                  className="form-nav-icon-btn"
                >
                  <ArrowRight className="h-5 w-5 rotate-180" />
                </button>
                <button
                  type="button"
                  disabled={!canGoStep2}
                  onClick={() => setStep(2)}
                  className="btn-primary form-nav-primary-btn flex-1"
                >
                  Continuer
                  <ArrowRight className="h-5 w-5" />
                </button>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="flex flex-1 flex-col">
              <div className="mb-8">
                <h1 className="font-brand text-3xl font-bold tracking-tight text-stone-800 lg:text-4xl">
                  Détails de l’étape
                </h1>
                <p className="mt-3 text-base leading-relaxed text-stone-500">
                  Ajustez les horaires et les infos utiles.
                </p>
              </div>

              <div className="space-y-6">
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label htmlFor="departure" className="mb-2 block text-xs font-semibold uppercase tracking-wider text-stone-400">
                      Départ
                    </label>
                    <input
                      id="departure"
                      type="time"
                      value={departureTime}
                      onChange={(e) => setDepartureTime(e.target.value)}
                      className="w-full rounded-xl border-2 border-stone-200 bg-white px-3 py-2.5 text-center text-sm font-semibold text-stone-800 transition-colors focus:border-teal-600 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label htmlFor="arrival" className="mb-2 block text-xs font-semibold uppercase tracking-wider text-stone-400">
                      Arrivée
                    </label>
                    <input
                      id="arrival"
                      type="time"
                      value={arrivalTime}
                      onChange={(e) => setArrivalTime(e.target.value)}
                      className="w-full rounded-xl border-2 border-stone-200 bg-white px-3 py-2.5 text-center text-sm font-semibold text-stone-800 transition-colors focus:border-teal-600 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label htmlFor="duration" className="mb-2 block text-xs font-semibold uppercase tracking-wider text-stone-400">
                      Durée
                    </label>
                    <div className="relative">
                      <input
                        id="duration"
                        type="number"
                        min="0"
                        value={estimatedDuration}
                        onChange={(e) => setEstimatedDuration(e.target.value)}
                        placeholder="--"
                        className="w-full rounded-xl border-2 border-stone-200 bg-white px-3 py-2.5 text-center text-sm font-semibold text-stone-800 transition-colors focus:border-teal-600 focus:outline-none"
                      />
                      <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs text-stone-400">
                        min
                      </span>
                    </div>
                  </div>
                </div>

                {typeConfig.showLinePlatform && (
                  <>
                    <div className="h-px bg-stone-100" />

                    <div className="grid grid-cols-2 gap-4">
                      <div className="relative">
                        <label className="pointer-events-none absolute left-0 top-0 text-xs font-semibold uppercase tracking-wider text-stone-400">
                          Ligne
                        </label>
                        <input
                          type="text"
                          value={lineName}
                          onChange={(e) => setLineName(e.target.value)}
                          placeholder="Yamanote"
                          className="input-floating text-sm"
                        />
                      </div>
                      <div className="relative">
                        <label className="pointer-events-none absolute left-0 top-0 text-xs font-semibold uppercase tracking-wider text-stone-400">
                          Quai / Sortie
                        </label>
                        <input
                          type="text"
                          value={platform}
                          onChange={(e) => setPlatform(e.target.value)}
                          placeholder="Quai 5"
                          className="input-floating text-sm"
                        />
                      </div>
                    </div>
                  </>
                )}

                <div className="relative">
                  <label className="pointer-events-none absolute left-0 top-0 text-xs font-semibold uppercase tracking-wider text-stone-400">
                    Lien utile
                  </label>
                  <input
                    type="url"
                    value={link}
                    onChange={(e) => setLink(e.target.value)}
                    placeholder="maps.app.goo.gl/..."
                    className="input-floating text-sm"
                  />
                </div>

                <div>
                  <label htmlFor="note" className="mb-2 block text-xs font-semibold uppercase tracking-wider text-stone-400">
                    Note
                  </label>
                  <textarea
                    id="note"
                    rows={2}
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    placeholder="Infos complémentaires..."
                    className="w-full resize-none rounded-2xl border-2 border-stone-200 bg-stone-50/50 px-4 py-3 text-sm font-medium text-stone-800 placeholder:text-stone-300 transition-colors focus:border-teal-600 focus:bg-white focus:outline-none"
                  />
                </div>
              </div>

              <div className="mt-auto flex gap-3 pt-8">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="form-nav-icon-btn"
                >
                  <ArrowRight className="h-5 w-5 rotate-180" />
                </button>
                <button
                  type="button"
                  onClick={handleSubmit}
                  className="btn-primary form-nav-primary-btn flex-1"
                >
                  Ajouter l’étape
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </PageLayout>
  );
}
