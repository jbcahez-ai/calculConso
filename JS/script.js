/**
 * Le Voyage Heure - Calculateur
 * Calcule le montant restant à payer au client
 */

function formatEuro(value) {
  return value.toFixed(2) + " €";
}

function formatTime(input) {
  let value = input.value.replace(/[^0-9]/g, '');
  
  if (value.length > 4) {
    value = value.slice(0, 4);
  }
  
  if (value.length >= 3) {
    input.value = value.slice(0, 2) + ':' + value.slice(2);
  } else {
    input.value = value;
  }
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

function getDeductionMinutes() {
  let deduction = 0;
  if (document.getElementById("escape").checked) deduction += 120;
  if (document.getElementById("haches").checked) deduction += 60;
  if (document.getElementById("levelup").checked) deduction += 30;
  return deduction;
}

function calculateDurationFromTimes() {
  const arrival = document.getElementById("arrivalTime").value.trim();
  const departure = document.getElementById("departureTime").value.trim();

  if (!arrival || !departure) {
    return 0;
  }

  let arrHour, arrMin, depHour, depMin;
  
  if (arrival.includes(':')) {
    const parts = arrival.split(':');
    arrHour = parseInt(parts[0]);
    arrMin = parseInt(parts[1]);
  } else {
    arrHour = parseInt(arrival.substring(0, 2));
    arrMin = parseInt(arrival.substring(2, 4));
  }

  if (departure.includes(':')) {
    const parts = departure.split(':');
    depHour = parseInt(parts[0]);
    depMin = parseInt(parts[1]);
  } else {
    depHour = parseInt(departure.substring(0, 2));
    depMin = parseInt(departure.substring(2, 4));
  }

  if (isNaN(arrHour) || isNaN(arrMin) || isNaN(depHour) || isNaN(depMin)) {
    return 0;
  }
  if (arrHour < 0 || arrHour > 23 || arrMin < 0 || arrMin > 59) {
    return 0;
  }
  if (depHour < 0 || depHour > 23 || depMin < 0 || depMin > 59) {
    return 0;
  }

  let arrivalMinutes = arrHour * 60 + arrMin;
  let departureMinutes = depHour * 60 + depMin;

  if (departureMinutes < arrivalMinutes) {
    departureMinutes += 24 * 60;
  }

  return departureMinutes - arrivalMinutes;
}

function updateDuration() {
  const baseDuration = calculateDurationFromTimes();
  const deduction = getDeductionMinutes();
  const finalDuration = Math.max(0, baseDuration - deduction);

  document.getElementById("durationDisplay").textContent = finalDuration;
}

function calculate() {
  const people = Number(document.getElementById("people").value);
  const minutes = calculateDurationFromTimes() - getDeductionMinutes();
  const consumptions = Number(document.getElementById("consumptions").value);
  const bill = Number(document.getElementById("bill").value);

  if (!people || people <= 0) {
    alert("Veuillez entrer le nombre de personnes");
    return;
  }
  
  if (minutes <= 0) {
    alert("Veuillez entrer des horaires valides (arrivée et départ)");
    return;
  }
  
  if (isNaN(consumptions) || consumptions < 0 || isNaN(bill) || bill < 0) {
    alert("Veuillez remplir les champs de consommations et note avec des valeurs valides");
    return;
  }

  const hours = minutes / 60;

  const consumptionsPerSession = Math.max(1, Math.ceil((minutes - 20) / 60));
  const expectedConsumptions = people * consumptionsPerSession;
  
  const twentyMinutesBlocks = Math.ceil((minutes - 2) / 20);
  const expectedAmount = people * twentyMinutesBlocks * 1;

  const calc1 = expectedConsumptions <= consumptions ? 0 : (expectedConsumptions - consumptions) * 2.4;
  
  const calc2 = expectedAmount - bill;

  let result = Math.min(calc1, calc2);

  if (result < 0) result = 0;

  result = Math.ceil(result / 0.80) * 0.80;

  addLog(people, minutes, consumptions, expectedConsumptions, expectedAmount, calc1, calc2, result);

  document.getElementById("details").innerHTML = `
    <strong>Détails du calcul :</strong><br><br>
    Durée en heures : ${hours.toFixed(2)} h<br>
    Conso attendues : ${expectedConsumptions.toFixed(2)}<br>
    Montant attendu : ${formatEuro(expectedAmount)}<br><br>
    Calcul 1 : ${formatEuro(calc1)}<br>
    Calcul 2 : ${formatEuro(calc2)}
  `;

  document.getElementById("final").innerHTML =
    "Il reste a payer au client : " + formatEuro(result);
}

function resetFields() {
  document.getElementById("people").value = "";
  document.getElementById("arrivalTime").value = "";
  document.getElementById("departureTime").value = "";
  document.getElementById("consumptions").value = "";
  document.getElementById("bill").value = "";
  document.getElementById("escape").checked = false;
  document.getElementById("haches").checked = false;
  document.getElementById("levelup").checked = false;

  document.getElementById("durationDisplay").textContent = "--";
  document.getElementById("details").innerHTML = "";
  document.getElementById("final").innerHTML = "";
}

document.addEventListener("DOMContentLoaded", function() {
  const inputs = document.querySelectorAll("input[type='number'], input[type='text']");
  const checkboxes = document.querySelectorAll("input[type='checkbox']");
  
  inputs.forEach(input => {
    input.addEventListener("keypress", function(event) {
      if (event.key === "Enter") {
        calculate();
      }
    });
    input.addEventListener("change", updateDuration);
  });

  checkboxes.forEach(checkbox => {
    checkbox.addEventListener("change", updateDuration);
  });
});
