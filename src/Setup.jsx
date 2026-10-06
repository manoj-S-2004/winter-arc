import { useState } from "react";

const MAX_PHOTO_BYTES = 2 * 1024 * 1024;

function Setup({ onStart }) {
  const [startingWeight, setStartingWeight] = useState("");
  const [targetWeight, setTargetWeight] = useState("");
  const [startDate, setStartDate] = useState("2026-10-01");
  const [photo, setPhoto] = useState(null);

  // ==============================
  // PHOTO UPLOAD
  // ==============================

  const handlePhotoChange = (event) => {
    const file = event.target.files[0];

    if (!file) {
      return;
    }

    if (file.size > MAX_PHOTO_BYTES) {
      alert("Please choose a photo under 2 MB.");
      event.target.value = "";
      return;
    }

    const reader = new FileReader();

    reader.onload = () => {
      setPhoto(reader.result);
    };

    reader.onerror = () => {
      alert("Could not read that photo. Please try another image.");
      event.target.value = "";
    };

    reader.readAsDataURL(file);
  };


  // ==============================
  // START WINTER ARC
  // ==============================

  const handleStart = () => {
    const startWeight = Number(startingWeight);
    const goalWeight = Number(targetWeight);

    if (
      !startingWeight ||
      !targetWeight ||
      !Number.isFinite(startWeight) ||
      !Number.isFinite(goalWeight) ||
      startWeight <= 0 ||
      goalWeight <= 0
    ) {
      alert("Please enter valid starting and target weights.");
      return;
    }

    if (!startDate) {
      alert("Please choose a start date.");
      return;
    }

    onStart({
      startingWeight: startWeight,
      targetWeight: goalWeight,
      startDate,
      photo,
    });
  };


  // ==============================
  // UI
  // ==============================

  return (
    <div className="setup-page">

      <div className="setup-card">

        {/* HEADER */}

        <div className="setup-header">

          <p className="small-title">
            90 DAY TRANSFORMATION
          </p>

          <h1>
            ❄️ WINTER ARC
          </h1>

          <p className="setup-subtitle">
            Your 90-day journey starts here.
          </p>

        </div>


        {/* STARTING WEIGHT */}

        <div className="input-group">

          <label>
            Starting Weight
          </label>

          <div className="weight-input">

            <input
              type="number"
              placeholder="Enter weight"
              min="1"
              step="0.1"
              value={startingWeight}
              onChange={(e) =>
                setStartingWeight(e.target.value)
              }
            />

            <span>
              kg
            </span>

          </div>

        </div>


        {/* TARGET WEIGHT */}

        <div className="input-group">

          <label>
            Target Weight
          </label>

          <div className="weight-input">

            <input
              type="number"
              placeholder="Enter weight"
              min="1"
              step="0.1"
              value={targetWeight}
              onChange={(e) =>
                setTargetWeight(e.target.value)
              }
            />

            <span>
              kg
            </span>

          </div>

        </div>


        {/* START DATE */}

        <div className="input-group">

          <label>
            Start Date
          </label>

          <input
            className="date-input"
            type="date"
            value={startDate}
            onChange={(e) =>
              setStartDate(e.target.value)
            }
          />

        </div>


        {/* STARTING PHOTO */}

        <div className="input-group">

          <label>
            Starting Photo
          </label>

          <label className="photo-upload">

            {photo ? (
              <img
                src={photo}
                alt="Starting"
              />
            ) : (
              <>
                <span className="upload-icon">
                  📷
                </span>

                <span>
                  Upload your starting photo
                </span>

                <small>
                  This will be your Day 1 photo
                </small>
              </>
            )}

            <input
              type="file"
              accept="image/*"
              onChange={handlePhotoChange}
            />

          </label>

        </div>


        {/* START BUTTON */}

        <button
          className="start-button"
          onClick={handleStart}
        >
          START WINTER ARC 🚀
        </button>


        {/* FOOTER */}

        <p className="setup-footer">
          90 DAYS • NO EXCUSES • DISCIPLINE
        </p>

      </div>

    </div>
  );
}

export default Setup;
