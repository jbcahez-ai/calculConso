/**
 * Le Voyage Heure - Calculateur
 * Calcule le montant restant à payer au client
 */

function formatEuro(value) {
  return value.toFixed(2) + " €";
}

function calculate() {
  const people = Number(document.getElementById("people").value);
  const minutes = Number(document.getElementById("duration").value);
  const consumptions = Number(document.getElementById("consumptions").value);
  const bill = Number(document.getElementById("bill").value);

  // Validation des champs
  if (!people || !minutes || minutes < 0 || !consumptions || consumptions < 0 || bill < 0) {
    alert("Veuillez remplir tous les champs avec des valeurs valides");
    return;
  }

  const hours = minutes / 60;

  // Conso par heure entamée avec 20min de tolérance (minimum 1 conso)
  const consumptionsPerSession = Math.max(1, Math.ceil((minutes - 20) / 60));
  const expectedConsumptions = people * consumptionsPerSession;
  const expectedAmount = expectedConsumptions * 3;

  const calc1 = expectedConsumptions <= consumptions ? 0 : (expectedConsumptions - consumptions) * 2.4;
  
  // Calc2 : nbre de personnes × nbre de tranches de 20min (tolérance 2min) × 0.80€
  const twentyMinutesBlocks = Math.floor((minutes - 2) / 20);
  const calc2 = people * twentyMinutesBlocks * 0.80 - bill;

  let result = Math.min(calc1, calc2);

  // 🔒 Sécurité : pas de négatif
  if (result < 0) result = 0;

  document.getElementById("details").innerHTML = `
    <strong>Détails du calcul :</strong><br><br>
    ⏱️ Durée en heures : ${hours.toFixed(2)} h<br>
    🍹 Conso attendues : ${expectedConsumptions.toFixed(2)}<br>
    💰 Montant attendu : ${formatEuro(expectedAmount)}<br><br>
    📊 Calcul 1 : ${formatEuro(calc1)}<br>
    📊 Calcul 2 : ${formatEuro(calc2)}
  `;

  document.getElementById("final").innerHTML =
    "✨ Il reste à payer au client : " + formatEuro(result);
}

function resetFields() {
  document.getElementById("people").value = "";
  document.getElementById("duration").value = "";
  document.getElementById("consumptions").value = "";
  document.getElementById("bill").value = "";

  document.getElementById("details").innerHTML = "";
  document.getElementById("final").innerHTML = "";
}

// Permet d'appuyer sur Entrée pour calculer
document.addEventListener("DOMContentLoaded", function() {
  const inputs = document.querySelectorAll("input");
  inputs.forEach(input => {
    input.addEventListener("keypress", function(event) {
      if (event.key === "Enter") {
        calculate();
      }
    });
  });
});
