/**
 * Le Voyage Heure - Calculateur
 * Calcule le montant restant à payer au client
 */

function formatEuro(value) {
  return value.toFixed(2) + " €";
}

function formatDateTime(date) {
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const seconds = String(date.getSeconds()).padStart(2, '0');
  return `${day}/${month}/${year} ${hours}:${minutes}:${seconds}`;
}

function addLog(people, minutes, consumptions, expectedConsumptions, expectedAmount, calc1, calc2, result) {
  const logs = JSON.parse(localStorage.getItem('logs') || '[]');
  const logEntry = {
    dateTime: formatDateTime(new Date()),
    people,
    minutes,
    consumptions,
    bill: Number(document.getElementById("bill").value),
    expectedConsumptions,
    expectedAmount,
    calc1,
    calc2,
    result
  };
  logs.push(logEntry);
  localStorage.setItem('logs', JSON.stringify(logs));
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
  
  // Montant attendu : nbre de tranches de 20min (tolérance 2min) × 1€ × nbre de personnes
  const twentyMinutesBlocks = Math.ceil((minutes - 2) / 20);
  const expectedAmount = people * twentyMinutesBlocks * 1;

  const calc1 = expectedConsumptions <= consumptions ? 0 : (expectedConsumptions - consumptions) * 2.4;
  
  // Calc2 : montant attendu - prix de la note en cours
  const calc2 = expectedAmount - bill;

  let result = Math.min(calc1, calc2);

  // 🔒 Sécurité : pas de négatif
  if (result < 0) result = 0;

  // Arrondir au-dessus au multiple de 0.80€
  result = Math.ceil(result / 0.80) * 0.80;

  // Ajouter au log
  addLog(people, minutes, consumptions, expectedConsumptions, expectedAmount, calc1, calc2, result);

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
