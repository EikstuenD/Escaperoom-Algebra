function checkLevel1() {
    const answer = document.getElementById('input1').value;
    // Svaret på 12 - 5 + 3 = 10
    if (answer == "10") {
        document.getElementById('room1').classList.remove('active');
        document.getElementById('room2').classList.add('active');
    } else {
        alert("FEIL KODE. Prøv igjen, agent.");
    }
}

function checkLevel2() {
    const answer = document.getElementById('input2').value;
    // Tallfølge: 3, 7, 11, 15, 19, 23 (Nummer 6 er 23)
    if (answer == "23") {
        document.getElementById('room2').classList.remove('active');
        document.getElementById('room3').classList.add('active');
    } else {
        alert("FEIL KODE. Mønsteret stemmer ikke.");
    }
}

function checkLevel3() {
    const answer = document.getElementById('input3').value;
    // Ligning: 2x + 4 = 16 => 2x = 12 => x = 6
    if (answer == "6") {
        document.getElementById('room3').classList.remove('active');
        document.getElementById('victory').classList.add('active');
        document.getElementById('status-text').innerText = "TILGANG INNVILGET";
    } else {
        alert("FEIL KODE. Ligningen er ikke i balanse.");
    }
}
