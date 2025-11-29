import Movie from "../models/movie.model.js";
import cloudinary from "../config/cloudinary.js";

/* ------------------ 🔹 Helper: Upload Buffer to Cloudinary ------------------ */
const uploadToCloudinary = (fileBuffer, folder = "movies") =>
  new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder, resource_type: "image" },
      (error, result) => (error ? reject(error) : resolve(result))
    );
    stream.end(fileBuffer);
  });

/* ------------------ 🟢 ADD MOVIE ------------------ */
/* ------------------ ADD MOVIE (100% WORKING - ZERO ERROR) ------------------ */
export const addMovie = async (req, res) => {
  try {
    const body = req.body;

    // 1. Main Poster (file ya direct URL)
    let mainPoster = "";

    if (req.files?.mainPoster?.[0]) {
      // File upload mila → Cloudinary
      const result = await uploadToCloudinary(req.files.mainPoster[0].buffer);
      mainPoster = result.secure_url;
    } 
    else if (body.mainPosterUrl && body.mainPosterUrl.trim()) {
      // Direct URL mila
      mainPoster = body.mainPosterUrl.trim();
    }

    // 2. Gallery Images (file + direct URL dono)
    const galleryFiles = req.files?.imgSample || [];
    const directUrls = body.imgUrls 
      ? (Array.isArray(body.imgUrls) ? body.imgUrls : [body.imgUrls])
      : [];

    let imgSampleUrls = [];

    // Cloudinary wale upload karo
    if (galleryFiles.length > 0) {
      const uploaded = await Promise.all(
        galleryFiles.map(file => uploadToCloudinary(file.buffer))
      );
      imgSampleUrls = uploaded.map(r => r.secure_url);
    }

    // Direct URLs add karo
    directUrls.forEach(url => {
      if (url && typeof url === "string" && url.trim()) {
        imgSampleUrls.push(url.trim());
      }
    });

    // Movie create
    const movie = await Movie.create({
      title: body.title?.trim() || "Untitled Movie",
      image: mainPoster,
      imdbRating: Number(body.imdbRating) || 0,
      actors: body.actors ? body.actors.split(",").map(a => a.trim()) : [],
      director: body.director || "",
      language: body.language || "",
      quality: body.quality || "",
      imgSample: imgSampleUrls,
      downloadLinks: body.downloadLinks ? body.downloadLinks.split(",").map(a => a.trim()) : [],
      description: body.description ? body.description.split("\n").filter(Boolean) : [],
      genres: body.genres ? body.genres.split(",").map(g => g.trim()) : [],
      categories: body.categories ? body.categories.split(",").map(c => c.trim()) : [],
      // baaki sab fields jo pehle the, woh bhi daal do agar use karte ho
      howToDownload: body.howToDownload || "",
      telegramLink: body.telegramLink || "",
      titleNameLanguage: body.titleNameLanguage || "",
      againTitle: body.againTitle ? body.againTitle.split(",").map(a => a.trim()) : [],
      releaseYear: body.releaseYear ? body.releaseYear.split(",").map(n => Number(n.trim())) : [],
      genre: body.genre || "",
    });

    return res.status(201).json({
      success: true,
      message: "Movie added successfully!",
      movie,
    });

  } catch (error) {
    console.error("Add Movie Error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error: " + error.message,
    });
  }
};
// export const addMovie = async (req, res) => {
//   try {
//     const body = req.body;

//     // ✅ Separate main image & sample images
//     const mainImageFile = req.files?.image?.[0];
//     const imgSampleFiles = req.files?.imgSample || [];

//     // ✅ Upload to Cloudinary
//     let mainPoster = "";
//     if (mainImageFile) {
//       const result = await uploadToCloudinary(mainImageFile.buffer);
//       mainPoster = result.secure_url;
//     }

//     const imgSampleUrls = await Promise.all(
//       imgSampleFiles.map(async (file) => {
//         const result = await uploadToCloudinary(file.buffer);
//         return result.secure_url;
//       })
//     );

//     // ✅ Create movie
//     const movie = await Movie.create({
//       title: body.title?.trim(),
//       image: mainPoster,
//       howToDownload: body.howToDownload || "",
//       telegramLink: body.telegramLink || "",
//       titleNameLanguage: body.titleNameLanguage || "",
//       imdbRating: Number(body.imdbRating) || 0,
//       genre: body.genre || "",
//       actors: body.actors ? body.actors.split(",").map((a) => a.trim()) : [],
//       director: body.director || "",
//       language: body.language || "",
//       quality: body.quality || "",
//       imgSample: imgSampleUrls,
//       againTitle: body.againTitle ? body.againTitle.split(",").map((a) => a.trim()) : [],
//       downloadLinks: body.downloadLinks
//         ? body.downloadLinks.split(",").map((a) => a.trim())
//         : [],
//       description: body.description
//         ? body.description.split("\n").filter(Boolean)
//         : [],
//       releaseYear: body.releaseYear
//         ? body.releaseYear.split(",").map((n) => Number(n.trim()))
//         : [],
//       genres: body.genres ? body.genres.split(",").map((g) => g.trim()) : [],
//       categories: body.categories ? body.categories.split(",").map((c) => c.trim()) : [],
//     });

//     res.status(201).json({
//       success: true,
//       message: "🎬 Movie added successfully!",
//       movie,
//     });
//   } catch (error) {
//     console.error("❌ Error in addMovie:", error);
//     res.status(500).json({ success: false, message: error.message });
//   }
// };

/* ------------------ 🟡 GET ALL MOVIES ------------------ */
export const getMovies = async (req, res) => {
  try {
    const movies = await Movie.find().sort({ createdAt: -1 });
    res.status(200).json({ success: true, movies });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error fetching movies" });
  }
};

/* ------------------ 🔵 GET MOVIE BY ID ------------------ */
export const getMovieById = async (req, res) => {
  try {
    const movie = await Movie.findById(req.params.id);
    if (!movie)
      return res.status(404).json({ success: false, message: "Movie not found" });
    res.status(200).json({ success: true, movie });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/* ------------------ 🟠 UPDATE MOVIE ------------------ */
export const updateMovie = async (req, res) => {
  try {
    const movie = await Movie.findById(req.params.id);
    if (!movie) return res.status(404).json({ message: "Movie not found" });

    const body = req.body;

    // ✅ Handle new uploads
    const mainImageFile = req.files?.image?.[0];
    const imgSampleFiles = req.files?.imgSample || [];

    if (mainImageFile) {
      const result = await uploadToCloudinary(mainImageFile.buffer);
      movie.image = result.secure_url;
    }

    if (imgSampleFiles.length > 0) {
      const results = await Promise.all(
        imgSampleFiles.map((file) => uploadToCloudinary(file.buffer))
      );
      movie.imgSample = results.map((r) => r.secure_url);
    }

    // ✅ Update text fields
    Object.assign(movie, {
      title: body.title ?? movie.title,
      howToDownload: body.howToDownload ?? movie.howToDownload,
      telegramLink: body.telegramLink ?? movie.telegramLink,
      titleNameLanguage: body.titleNameLanguage ?? movie.titleNameLanguage,
      imdbRating:
        body.imdbRating !== undefined ? Number(body.imdbRating) : movie.imdbRating,
      genre: body.genre ?? movie.genre,
      actors: body.actors
        ? body.actors.split(",").map((a) => a.trim())
        : movie.actors,
      director: body.director ?? movie.director,
      language: body.language ?? movie.language,
      quality: body.quality ?? movie.quality,
      againTitle: body.againTitle
        ? body.againTitle.split(",").map((a) => a.trim())
        : movie.againTitle,
      downloadLinks: body.downloadLinks
        ? body.downloadLinks.split(",").map((a) => a.trim())
        : movie.downloadLinks,
      description: body.description
        ? body.description.split("\n").filter(Boolean)
        : movie.description,
      releaseYear: body.releaseYear
        ? body.releaseYear.split(",").map((n) => Number(n.trim()))
        : movie.releaseYear,
      genres: body.genres
        ? body.genres.split(",").map((g) => g.trim())
        : movie.genres,
      categories: body.categories
        ? body.categories.split(",").map((c) => c.trim())
        : movie.categories,
    });

    await movie.save();

    res.status(200).json({
      success: true,
      message: "✅ Movie updated successfully!",
      movie,
    });
  } catch (error) {
    console.error("❌ Error in updateMovie:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

/* ------------------ 🔴 DELETE MOVIE ------------------ */
export const deleteMovie = async (req, res) => {
  try {
    const movie = await Movie.findById(req.params.id);
    if (!movie)
      return res.status(404).json({ success: false, message: "Movie not found" });

    // ✅ Delete images from Cloudinary
    const deletePromises = movie.imgSample.map(async (url) => {
      const publicId = url.split("/").slice(-1)[0].split(".")[0];
      try {
        await cloudinary.uploader.destroy(`movies/${publicId}`);
      } catch {
        console.warn("⚠️ Skipped deletion:", url);
      }
    });
    await Promise.all(deletePromises);

    await movie.deleteOne();
    res
      .status(200)
      .json({ success: true, message: "🗑️ Movie deleted successfully" });
  } catch (error) {
    console.error("❌ Error in deleteMovie:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};




/////////////////////////////////////////////////////////////

// import { json } from "express";
// import Movie from "../models/movie.model.js";

// // Add Movie
// export const addMovie = async (req, res) => {
//     try {
//         const {
//             title,
//         howToDownload,
//       telegramLink,
//       titleNameLanguage,
//       imdbRating,
//       genre,
//       actors,
//       director,
//       language,
//       quality,
//       againTitle,
//       downloadLinks,
//       description,
//       releaseYear,
//       genres,
//       categories,
//         } = req.body;

//         const image = req.file ? req.file.path : "";   // Cloudinary image URL
//         const newMovie = new Movie({
//             title,
//             image, 
//             howToDownload,
//       telegramLink,
//       titleNameLanguage,
//       imdbRating,
//       genre,
//       actors: actors ? actors.split(",") : [],
//       director,
//       language,
//       quality,
//       againTitle: againTitle ? againTitle.split(",") : [],
//       downloadLinks: downloadLinks ? downloadLinks.split(",") : [],
//       description: description ? description.split(",") : [],
//       releaseYear: releaseYear ? releaseYear.split(",") : [],
//       genres: genres ? genres.split(",") : [],
//       categories: categories ? categories.split(",") : [],
//         });

//         await newMovie.save();
//         res.status(201).json({ success:true, message: "Movie added successfully", movie: newMovie})
//     } catch (error) {
//         res.status(500).json({ success: false, message: "Error adding movie", error: error.message})
//     }
// };

// // Get All Movies
// export const getMovies = async (req, res) => {
//     try {
//         const movies = await Movie.find();
//         res.status(200).json({ success: true, movies })
//     } catch (error) {
//         res.status(500).json({ success: false, message: "Error fetching movies", error: error.message});
//     }
// };

// // Get Single Movie
// export const getMovieById = async (req, res) => {
//     try {
//         const movie = await Movie.findById(req.params.id);
//         if (!movie) return res.status(404).json({message: "Movie not found"});
//         res.status(200).json({ success: true, movie });
//     } catch (error) {
//         res.status(500).json({ success: false, message: "Error fetching movie", error: error.message });
//     }
// };

// // Update Movie
// export const updateMovie = async (req, res) => {
//   try {
//     const movie = await Movie.findById(req.params.id);
//     if (!movie) return res.status(404).json({ message: "Movie not found" });

//     const image = req.file ? req.file.path : movie.image;
//     Object.assign(movie, { ...req.body, image });
//     await movie.save();

//     res.status(200).json({ success: true, message: "Movie updated successfully", movie });
//   } catch (error) {
//     res.status(500).json({ success: false, message: "Error updating movie", error: error.message });
//   }
// };

// // Delete Movie
// export const deleteMovie = async (req, res) => {
//     try {
//         await Movie.findByIdAndDelete(req.params.id);
//         res.status(200).json({ success: true, message: "Movie Deleted successfully"})

//     } catch (error) {
//         res.status(500).json({ success: false, message: "Error deleting movie", error: error.message})
//     }
// };









