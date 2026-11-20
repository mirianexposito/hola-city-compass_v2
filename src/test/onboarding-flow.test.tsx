import { fireEvent, render, screen, waitFor, cleanup } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { CityProvider } from "@/components/city-provider";
import { OnboardingFlow } from "@/components/onboarding-flow";
import { decodeCityState, storageKey } from "@/lib/city-session";
import { questionnaireSteps } from "@/lib/questionnaire";

vi.mock("@tanstack/react-router", () => ({ useNavigate: () => vi.fn() }));
vi.mock("@/components/account-provider", () => ({
  useAccount: () => ({ user: null, ready: true }),
}));
vi.mock("@/lib/profile-storage", () => ({
  readProfile: vi.fn(),
  writeProfile: vi.fn(),
  removeProfile: vi.fn(),
}));
vi.mock("@/components/neighborhood-select", () => ({
  NeighborhoodSelect: ({
    value,
    onChange,
  }: {
    value: string;
    onChange: (value: string) => void;
  }) => (
    <select aria-label="Barrio" value={value} onChange={(event) => onChange(event.target.value)}>
      <option value="">Sin especificar</option>
      <option>Centro</option>
      <option>Casetas</option>
    </select>
  ),
}));

beforeEach(() => {
  localStorage.clear();
  sessionStorage.clear();
  vi.spyOn(window, "scrollTo").mockImplementation(() => {});
});
afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

async function start() {
  render(
    <CityProvider>
      <OnboardingFlow />
    </CityProvider>,
  );
  await screen.findByRole("button", { name: "Otra ciudad de España" });
}

function finishQuestionnaire() {
  for (const [index, question] of questionnaireSteps.entries()) {
    if (question.key === "neighborhood") {
      fireEvent.change(screen.getByRole("combobox", { name: "Barrio" }), {
        target: { value: "Centro" },
      });
    } else {
      fireEvent.click(screen.getByRole("button", { name: question.options[0] }));
    }
    fireEvent.click(
      screen.getByRole("button", {
        name: index === questionnaireSteps.length - 1 ? "Terminar" : "Continuar",
      }),
    );
  }
}

describe("Editing questionnaire answers", () => {
  it("returns from registration to the questionnaire to edit without changing other answers", async () => {
    await start();
    finishQuestionnaire();
    const before = decodeCityState(localStorage.getItem(storageKey)).preferences;
    fireEvent.click(screen.getByRole("button", { name: "Volver a las preguntas" }));
    fireEvent.click(screen.getByRole("button", { name: "Ir a la pregunta 1: ¿De dónde vienes?" }));
    fireEvent.click(screen.getByRole("button", { name: "Otro país" }));
    fireEvent.click(screen.getByRole("button", { name: "Continuar" }));
    fireEvent.click(screen.getByRole("button", { name: "Ir a la pregunta 10: ¿Qué edad tienes?" }));
    fireEvent.click(screen.getByRole("button", { name: "Terminar" }));
    await waitFor(() =>
      expect(decodeCityState(localStorage.getItem(storageKey)).preferences).toEqual({
        ...before,
        origin: "Otro país",
      }),
    );
  });

  it("returns to a previous question and preserves multiple choices and a free answer", async () => {
    await start();
    for (const question of questionnaireSteps.slice(0, 4)) {
      if (question.key === "neighborhood") {
        fireEvent.change(screen.getByRole("combobox", { name: "Barrio" }), {
          target: { value: "Centro" },
        });
      } else {
        fireEvent.click(screen.getByRole("button", { name: question.options[0] }));
      }
      fireEvent.click(screen.getByRole("button", { name: "Continuar" }));
    }
    fireEvent.click(screen.getByRole("button", { name: "Conocer gente" }));
    fireEvent.click(screen.getByRole("button", { name: "Otras" }));
    fireEvent.change(screen.getByLabelText("¿Qué más buscas?"), {
      target: { value: "Hacer voluntariado" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Continuar" }));
    fireEvent.click(
      screen.getByRole("button", { name: "Ir a la pregunta 5: ¿Qué buscas en esta nueva etapa?" }),
    );
    expect(decodeCityState(localStorage.getItem(storageKey)).preferences.goals).toEqual([
      "Conocer gente",
      "Hacer voluntariado",
    ]);
    fireEvent.change(screen.getByLabelText("¿Qué más buscas?"), {
      target: { value: "Aprender idiomas" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Continuar" }));
    expect(decodeCityState(localStorage.getItem(storageKey)).preferences.goals).toEqual([
      "Conocer gente",
      "Aprender idiomas",
    ]);
  });

  it("keeps the registration details when going back to edit the last question", async () => {
    await start();
    finishQuestionnaire();
    fireEvent.change(screen.getByLabelText("Tu nombre"), {
      target: { value: "Persona de prueba" },
    });
    fireEvent.change(screen.getByLabelText("Correo electrónico"), {
      target: { value: "prueba@example.com" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Volver a las preguntas" }));
    fireEvent.click(screen.getByRole("button", { name: "35–44" }));
    fireEvent.click(screen.getByRole("button", { name: "Terminar" }));
    expect(decodeCityState(localStorage.getItem(storageKey)).preferences.ageRange).toBe("35–44");
    // Returning must preserve the actual input values, not recreate blank fields.
    expect((screen.getByLabelText("Tu nombre") as HTMLInputElement).value).toBe(
      "Persona de prueba",
    );
    expect((screen.getByLabelText("Correo electrónico") as HTMLInputElement).value).toBe(
      "prueba@example.com",
    );
  });
});
