import { Component, input, OnInit } from '@angular/core';
import { ContentBlocksService } from '../../services/content-blocks.service';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { ContentBlock } from '../../models/content_block/content_block';
import { CommonModule } from '@angular/common';
import { Game, GameCategories } from '../../models/game/game';
import { GamesService } from '../../services/games.service';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { PostsService } from '../../services/posts.service';
import { Post } from '../../models/post/post';
import Swal from 'sweetalert2';
import { CategoriesService } from '../../services/categories.service';
import { Category } from '../../models/category/category';
import { GameUpdate } from '../../models/updateGame/updateGame';
import { ButtonComponent } from '../../shared/button/button.component';

import {
  FormBuilder,
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { filter } from 'rxjs';
import { UpdateGameService } from '../../services/update-games.service';
import { UploadImageService } from '../../services/upload-image.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-upload-game',
  imports: [
    CommonModule,
    TranslatePipe,
    RouterModule,
    ReactiveFormsModule,
    FormsModule,
    ButtonComponent,
  ],
  templateUrl: './upload-game.component.html',
  styleUrls: ['./upload-game.component.css'],
})
export class UploadGameComponent {
  // Loading
  isLoading = true;
  // User token
  sessionToken!: string;
  devVerif: boolean = true;
  // Game Data
  idGame!: string;
  gameData!: Game;
  contentBlockData!: ContentBlock[];
  gameCategoriesData!: GameCategories[];
  aCategories: Category[] = [];
  // Actual Data
  data!: GameUpdate;
  title!: string;
  // UPLOAD FORM
  uploadForm!: FormGroup;
  // Title
  gameTitle!: string;
  isTitleBeingEdited: boolean = false;
  // File
  selectedFile: File | null = null;
  fileError: boolean = false;
  fileName!: string;
  // Categories
  selectedCategories: Category[] = [];
  filteredCategories: Category[] = [];
  errNotACategory: boolean = false;
  errRepeatedCategory: boolean = false;
  errNoCategories: boolean = false;
  inputValue!: string;
  inputFocused: boolean = false;
  // Content Blocks
  numberOfBlocks: number = 0;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private contentBlockServ: ContentBlocksService,
    private postServ: PostsService,
    private gameServ: GamesService,
    private translate: TranslateService,
    private categoriesServ: CategoriesService,
    private updateServ: UpdateGameService,
    private uploadImageServ: UploadImageService,
    public authServ: AuthService,
    private fb: FormBuilder
  ) {}

  ngOnInit(): void {
    this.sessionToken = localStorage.getItem('user_session') || '';
    this.idGame = this.route.snapshot.paramMap.get('id') || '';
    this.developerVerification();
  }

  uploadFormValidate() {
    this.uploadForm = this.fb.group({
      title: [this.gameData.title || '', [Validators.required]],
      url: [
        this.gameData.download_url || '',
        [Validators.required, Validators.pattern(/^https:\/\/github\.com\/.+/)],
      ],
      description: [this.gameData.description || '', [Validators.required]],
      categories: [''],
    });

    this.uploadForm.get('categories')?.valueChanges.subscribe((value) => {
      this.onCategoryInput(value);
    });

    if (this.gameCategoriesData.length > 0) {
      this.selectedCategories = this.gameCategoriesData
        .map((gameCat) => this.aCategories.find((cat) => cat.id === gameCat.id))
        .filter((cat): cat is Category => !!cat);
    }

    this.isLoading = false;
  }

  get titleRequired() {
    return (
      this.uploadForm.get('title')?.errors?.['required'] &&
      this.uploadForm.get('title')?.touched
    );
  }

  get urlRequired() {
    return (
      this.uploadForm.get('url')?.errors?.['required'] &&
      this.uploadForm.get('url')?.touched
    );
  }

  get urlPattern() {
    return (
      this.uploadForm.get('url')?.errors?.['pattern'] &&
      this.uploadForm.get('url')?.touched
    );
  }
  get descriptionRequired() {
    return (
      this.uploadForm.get('description')?.errors?.['required'] &&
      this.uploadForm.get('description')?.touched
    );
  }

  preventSubmit(event: Event) {
    if (event instanceof KeyboardEvent) {
      event.preventDefault();
    }
  }

  toggleEdit() {
    this.isTitleBeingEdited = !this.isTitleBeingEdited;
  }

  editTitle() {
    this.gameTitle = this.uploadForm.get('title')?.value;
    this.toggleEdit();
  }

  uploadFile(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const file = input.files[0];

      // Validación personalizada, por ejemplo: solo imágenes
      if (!file.type.startsWith('image/')) {
        this.fileError = true;
        this.selectedFile = null;
      } else {
        this.selectedFile = file;
        this.fileError = false;
      }
    } else {
      this.selectedFile = null;
      this.fileError = false;
    }
  }

  onCategoryInput(value: string) {
    this.inputValue = value;

    this.filteredCategories = this.aCategories.filter((cat) =>
      cat.translatedName?.toLowerCase().includes(value.toLowerCase())
    );
  }

  addCategory() {
    const value = this.uploadForm.get('categories')?.value;

    const category = this.aCategories.find(
      (c) => c.translatedName.toLowerCase() === value.toLowerCase()
    );

    if (category) {
      if (
        !this.selectedCategories.find((cat) => cat.translatedName === value)
      ) {
        this.uploadForm.get('categories')?.setValue('');
        this.selectedCategories.push(category);
        this.errRepeatedCategory = false;
        this.errNoCategories = false;
      } else {
        this.errRepeatedCategory = true;
      }
      this.errNotACategory = false;
    } else {
      this.errNotACategory = true;
    }
  }

  deleteCategory(name: string) {
    this.selectedCategories = this.selectedCategories.filter(
      (c) => c.name !== name
    );
  }

  selectCategory(name: string) {
    this.uploadForm.get('categories')?.setValue(name);
  }

  categoriesRequired() {
    if (this.selectedCategories && this.selectedCategories.length > 0) {
      this.errNoCategories = false;
      return true;
    } else {
      this.errNotACategory = false;
      this.errRepeatedCategory = false;
      this.errNoCategories = true;

      return false;
    }
  }

  coverRequired() {
    if (this.selectedFile) {
      this.fileError = false;
      return true;
    } else {
      this.fileError = true;
      return false;
    }
  }

  onSubmit() {
    const categoriesValid = this.categoriesRequired();
    const coverValid = this.coverRequired();

    if (
      categoriesValid &&
      coverValid &&
      this.uploadForm.valid &&
      this.selectedFile
    ) {
      const gameCategories = this.selectedCategories.map((cat) => cat.id);

      this.uploadImage();

      setTimeout(() => {
        const data = {
          idGame: Number(this.idGame),
          game: [
            {
              title: this.gameTitle,
              download_url: this.uploadForm.value.url,
              description: this.uploadForm.value.description,
              cover: this.fileName,
            },
          ],
          categories: gameCategories,
          blocks: [],
        };

        this.updateSectionGame(data);
      }, 1000);
    }
  }

  /*
  {
    "idGame": 120,
    "game": [
      {
        "title": "Luis Super Sta",
        "download_url": "https://github.com/AntonioJRA/NovaGames",
        "description": "Esto es una descripcion",
        "cover": "luisSS.png"
      }
    ],
    "categories": [9],
    "blocks": [
      {
        "image_name": "imagen1.png",
        "content": "Primer bloque de contenido"
      },
      {
        "image_name": "imagen2.jpg",
        "content": "Segundo bloque con otro contenido"
      }
    ]
  }
  */

  // SERVICES

  developerVerification() {
    if (this.sessionToken) {
      this.authServ
        .developerVerification(this.sessionToken, Number(this.idGame))
        .subscribe({
          next: (data) => {
            if (data.message === 'Verif') {
              this.getGame();
            } else {
              this.devVerif = false;
            }
          },
          error: (err) => console.error(err),
        });
    }
  }
  getGame() {
    if (this.idGame) {
      this.gameServ.getGame(this.idGame).subscribe({
        next: (data) => {
          this.gameData = data;
          this.gameTitle = this.gameData.title;
          this.getContentBlocks();
        },
        error: (err) => console.error(err),
      });
    }
  }

  getContentBlocks() {
    if (this.idGame) {
      this.contentBlockServ.getContentBlocks(this.idGame).subscribe({
        next: (data) => {
          if (data.length > 0) {
            this.contentBlockData = data;
          }
          this.getGameCategories();
        },
        error: (err) => console.error(err),
      });
    }
  }

  getGameCategories() {
    this.gameServ.getGameCategories(this.idGame).subscribe({
      next: (data) => {
        if (!Array.isArray(data)) {
          this.gameCategoriesData = [];
        }
        this.gameCategoriesData = data;
        this.getCategories();
      },
      error: (err) => {
        console.log(err.message);
      },
    });
  }

  getCategories() {
    this.categoriesServ.getCategories().subscribe({
      next: (data) => {
        this.aCategories = data.map((cat: any) => ({
          ...cat,
          translatedName: this.translate.instant(
            `games.categories.${cat.name}`
          ),
        }));
        this.filteredCategories = this.aCategories;
        this.uploadFormValidate();
        // this.createObjectData()
      },
      error: (err) => {
        console.log(err.message);
      },
    });
  }

  updateSectionGame(data: GameUpdate) {
    this.updateServ.updateSectionGame(data).subscribe({
      next: (data) => {
        this.translate
          .get(['uploadGame.alert.title','uploadGame.alert.text'])
          .subscribe((translations) => {
            Swal.fire({
              icon: 'success',
              title: translations['uploadGame.alert.title'],
              text: translations['uploadGame.alert.text'],
              showConfirmButton: true,
            }).then(() => {
              this.router.navigate([`/game-section/${this.idGame}`]);
            });
          });
      },
      error: (err) => {
        console.log(err.message);
      },
    });
  }

  uploadImage() {
    if (this.selectedFile) {
      this.uploadImageServ
        .postImageToServer(this.sessionToken, this.selectedFile)
        .subscribe({
          next: (response) => {
            this.fileName = response.filename;
          },
          error: (err) => {
            console.error('Error subiendo la imagen:', err);
          },
        });
    }
  }
}

// createObjectData() {
//   const gameData = {
//     download_url: this.gameData.download_url,
//     cover: this.gameData.cover,
//     title: this.gameData.title,
//   };

//   const filteredGame = Object.fromEntries(
//     Object.entries(gameData).filter(([_, value]) => value != null)
//   );

//   const categoriesData = this.gameCategoriesData.map(c => c.id);

//   const filteredCategories = Array.isArray(categoriesData) && categoriesData.length > 0
//     ? categoriesData
//     : undefined;

//   this.data = {
//     idGame: Number(this.idGame),
//     game: [filteredGame]
//   };

//   if(filteredCategories) {
//     this.data = {
//       ...this.data,
//       categories: filteredCategories
//     }
//   }

//   const filteredBlocks = this.contentBlockData;

//   if(filteredBlocks) {
//     this.data = {
//       ...this.data,
//       blocks: filteredBlocks
//     }
//   }

//   this.isLoading = false;
// }
