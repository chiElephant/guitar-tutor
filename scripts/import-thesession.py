# Setup (once):  python3 -m venv .venv && . .venv/bin/activate && pip install music21
# Run:           python3 scripts/import-thesession.py      (from the repo root)
# Output:        content/tabs/<slug>.musicxml + <slug>.json sidecar + SOURCES.md. Delete a file to regenerate it.
import json, re, time, unicodedata, urllib.request
import xml.etree.ElementTree as ET
from pathlib import Path
from music21 import converter, instrument

# name -> thesession.org tune id. Only traditional tunes or composers dead 70+ years.
TUNES = {
    "The Kesh": 55, "Morrison's": 71, "Cooley's": 1, "Drowsy Maggie": 27, "The Butterfly": 10,
    "Banish Misfortune": 9, "The Musical Priest": 73, "Saint Anne's": 103, "Soldier's Joy": 1356,
    "The Arkansas Traveler": 5583, "The Little Beggarman": 566, "The Blackberry Blossom": 1365,
    "Old Joe Clark": 14474, "Cripple Creek": 23886, "Angeline The Baker": 14300,
    "The Star Of The County Down": 4320, "Planxty Irwin": 790, "Eleanor Plunkett": 2575,
    "Carolan's Draught": 1421, "Sí Bheag Sí Mhór": 449, "The South Wind": 601,
    "The Water Is Wide": 16776, "Shady Grove": 14220, "Greensleeves": 1598,
    "The Irish Washerwoman": 92, "The Swallowtail": 106, "Haste To The Wedding": 582,
    "Off To California": 30, "The Harvest Home": 49, "The Rights Of Man": 83,
    "The Boys Of Bluehill": 651, "Fisher's": 872, "Scarborough Fair": 7522, "Amazing Grace": 2749,
    "The Derry Air": 6867, "The Blarney Pilgrim": 5, "The Road To Lisdoonvarna": 250,
    "Fanny Power": 957, "Tabhair Dom Do Lámh": 454, "Auld Lang Syne": 12441, "The Ash Grove": 997,
}
COMPOSERS = {  # everything else is "Traditional"
    "Planxty Irwin": "Turlough O'Carolan", "Eleanor Plunkett": "Turlough O'Carolan",
    "Carolan's Draught": "Turlough O'Carolan", "Sí Bheag Sí Mhór": "Turlough O'Carolan",
    "Fanny Power": "Turlough O'Carolan", "Angeline The Baker": "Stephen Foster",
    "Tabhair Dom Do Lámh": "Ruairí Dall Ó Catháin",
}
METER = {"reel": "4/4", "jig": "6/8", "slip jig": "9/8", "hornpipe": "4/4", "polka": "2/4", "waltz": "3/4",
         "slide": "12/8", "barndance": "4/4", "march": "4/4", "mazurka": "3/4", "three-two": "3/2", "strathspey": "4/4"}
OUT = Path(__file__).resolve().parent.parent / "content" / "tabs"


def slugify(name):
    ascii_name = unicodedata.normalize("NFKD", name).encode("ascii", "ignore").decode()
    return re.sub(r"[^a-z0-9]+", "-", ascii_name.lower().replace("'", "")).strip("-")


def fetch(tune_id):
    req = urllib.request.Request(f"https://thesession.org/tunes/{tune_id}?format=json",
                                 headers={"User-Agent": "guitar-tutor-import/0.1"})
    with urllib.request.urlopen(req, timeout=30) as r:
        return json.load(r)


# Guitar is written an octave above sounding pitch; these are the WRITTEN midi numbers of the open strings, 1 = high e.
WRITTEN_TUNING = {1: 76, 2: 71, 3: 67, 4: 62, 5: 57, 6: 52}
SOUNDING = [("E", 2), ("A", 2), ("D", 3), ("G", 3), ("B", 3), ("E", 4)]  # MusicXML staff-tuning line 1 = lowest string
STEP = {"C": 0, "D": 2, "E": 4, "F": 5, "G": 7, "A": 9, "B": 11}


def string_and_fret(midi):
    """shortcut: lowest fret that fits each note, no position planning; upgrade if phrases jump strings awkwardly."""
    fits = [(midi - m, s) for s, m in WRITTEN_TUNING.items() if 0 <= midi - m <= 19]
    return min(fits) if fits else None


def add_tab(path):
    """ABC carries no fingering, so alphaTab would draw notation only. Add string/fret per note and a 6-string staff."""
    tree = ET.parse(path); root = tree.getroot()
    if root.find(".//staff-details") is not None:
        return
    attrs = root.find(".//measure/attributes")
    details = ET.SubElement(attrs, "staff-details"); ET.SubElement(details, "staff-lines").text = "6"
    for line, (step, octave) in enumerate(SOUNDING, 1):
        t = ET.SubElement(details, "staff-tuning", line=str(line))
        ET.SubElement(t, "tuning-step").text = step; ET.SubElement(t, "tuning-octave").text = str(octave)
    tr = ET.SubElement(attrs, "transpose")
    ET.SubElement(tr, "diatonic").text = "0"; ET.SubElement(tr, "chromatic").text = "0"; ET.SubElement(tr, "octave-change").text = "-1"
    for note in root.iter("note"):
        pitch = note.find("pitch")
        if pitch is None:
            continue
        midi = 12 * (int(pitch.findtext("octave")) + 1) + STEP[pitch.findtext("step")] + int(float(pitch.findtext("alter") or 0))
        sf = string_and_fret(midi)
        if sf is None:
            continue
        notations = note.find("notations")
        if notations is None:
            notations = ET.SubElement(note, "notations")
        tech = ET.SubElement(notations, "technical")
        ET.SubElement(tech, "string").text = str(sf[1]); ET.SubElement(tech, "fret").text = str(sf[0])
    mt = root.find("movement-title")  # duplicates work-title and renders as a subtitle
    if mt is not None:
        root.remove(mt)
    tree.write(path, encoding="utf-8", xml_declaration=True)


assert string_and_fret(62) == (0, 4) and string_and_fret(76) == (0, 1) and string_and_fret(83) == (7, 1)
assert slugify("Sí Bheag Sí Mhór") == "si-bheag-si-mhor" and slugify("Cooley's") == "cooleys"
OUT.mkdir(parents=True, exist_ok=True)
for name, tune_id in TUNES.items():
    slug = slugify(name)
    if (OUT / f"{slug}.json").exists():
        continue
    try:
        tune = fetch(tune_id)
        time.sleep(0.5)
        setting = tune["settings"][0]
        abc = ("X:1\nT:%s\nR:%s\nM:%s\nL:1/8\nK:%s\n%s\n"
               % (name, tune["type"], METER[tune["type"]], setting["key"], setting["abc"].replace("!", "\n")))
        score = converter.parse(abc, format="abc")
        composer = COMPOSERS.get(name, "Traditional")
        score.metadata.title, score.metadata.composer = name, composer
        part = score.parts[0]
        part.partName = "Guitar"
        part.insert(0, instrument.AcousticGuitar())
        assert len(part.flatten().notes) > 0, "no notes parsed"
        score.write("musicxml", fp=OUT / f"{slug}.musicxml")
        add_tab(OUT / f"{slug}.musicxml")
        (OUT / f"{slug}.json").write_text(json.dumps({
            "title": name, "composer": composer, "type": tune["type"],
            "source": f"https://thesession.org/tunes/{tune_id}#setting{setting['id']}",
            "license": "CC BY-SA 4.0", "attribution": f"{setting['member']['name']} via thesession.org",
        }, ensure_ascii=False, indent=2) + "\n")
        print("ok  ", name)
    except Exception as e:  # keep going; the report at the end says what to fix
        print("FAIL", name, tune_id, repr(e))

for p in OUT.glob("*.musicxml"):
    add_tab(p)

lines = ["# Sources", "", "Tunes imported from [thesession.org](https://thesession.org); each setting is CC BY-SA 4.0,",
         "credited to the member who submitted it. Regenerate with `python3 scripts/import-thesession.py`", ""]
for meta in sorted((json.loads(p.read_text()) for p in OUT.glob("*.json")), key=lambda m: m["title"]):
    lines.append(f"- {meta['title']} ({meta['composer']}, {meta['type']}) — {meta['source']} — {meta['license']}, {meta['attribution']}")
(OUT / "SOURCES.md").write_text("\n".join(lines) + "\n")
