import { Component, OnInit } from '@angular/core';
import { ContentBlocksService } from '../../services/content-blocks.service';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { ContentBlock } from '../../models/content_block/content_block';
import { CommonModule } from '@angular/common';
import { Game } from '../../models/game/game';
import { GamesService } from '../../services/games.service';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { PostsService } from '../../services/posts.service';
import { Post } from '../../models/post/post';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-game-section',
  imports: [CommonModule, TranslatePipe, RouterModule],
  templateUrl: './game-section.component.html',
  styleUrls: ['./game-section.component.css'],
})
export class GameSectionComponent implements OnInit {
  isLoading = true;
  contentBlockData!: ContentBlock[];
  gameData!: Game;
  postsData!: Post[];
  sessionToken!: string;
  idGame!: string;
  oldUserRating!: number;
  rating: number = 0;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private contentBlockServ: ContentBlocksService,
    private postServ: PostsService,
    private gameServ: GamesService,
    private translate: TranslateService
  ) {}

  ngOnInit(): void {
    this.sessionToken = localStorage.getItem('user_session') || '';
    this.rating = 0;
    this.getGame();
    this.getGameRatingByUser();
  }

  setRating(value: number) {
    this.rating = this.rating === value ? 0 : value;
  }

  setNewRating(value: number) {
    this.oldUserRating = this.oldUserRating === value ? 0 : value;
    this.rating = this.oldUserRating;
  }

  // SERVICES
  getGame() {
    this.idGame = this.route.snapshot.paramMap.get('id') || '';
    if (this.idGame) {
      this.gameServ.getGame(this.idGame).subscribe({
        next: (data) => {
          this.gameData = data;
          this.getAllPosts();
        },
        error: (err) => console.error(err),
      });
    }
  }

  getAllPosts() {
    this.idGame = this.route.snapshot.paramMap.get('id') || '';
    if (this.idGame) {
      this.postServ.getAllPosts(this.idGame).subscribe({
        next: (data) => {
          this.postsData = data.slice(0, 5);
          this.getContentBlocks();
        },
        error: (err) => console.error(err),
      });
    }
  }

  getContentBlocks() {
    this.idGame = this.route.snapshot.paramMap.get('id') || '';
    if (this.idGame) {
      this.contentBlockServ.getContentBlocks(this.idGame).subscribe({
        next: (data) => {
          if (data.length > 0) {
            this.contentBlockData = data;
          }
          this.isLoading = false;
        },
        error: (err) => console.error(err),
      });
    }
  }

  getGameRatingByUser() {
    if (this.sessionToken) {
      this.gameServ
        .getGameRatingByUser(this.sessionToken, Number(this.idGame))
        .subscribe({
          next: (data) => {
            data
              ? (this.oldUserRating = Number(data.rating))
              : (this.oldUserRating = -1);
          },
          error: (err) => {
            console.log(err);
          },
        });
    }
  }

  addGameRating() {
    if (this.sessionToken) {
      this.gameServ
        .addGameRating(this.sessionToken, Number(this.idGame), this.rating)
        .subscribe({
          next: (data) => {
            this.translate
              .get(['gameSection.rating.alert'])
              .subscribe((translations) => {
                Swal.fire({
                  icon: 'success',
                  title: translations['gameSection.rating.alert'],
                  showConfirmButton: true,
                }).then((result) => {
                  if (result.isConfirmed) {
                    this.router
                      .navigateByUrl('/', { skipLocationChange: true })
                      .then(() => {
                        this.router.navigate([`/game-section/${this.idGame}`]);
                      });
                  }
                });
              });
          },
          error: (err) => {
            console.log(err);
          },
        });
    }
  }

  updateGameRating() {
    if (this.sessionToken) {
      this.gameServ
        .updateGameRating(this.sessionToken, Number(this.idGame), this.rating)
        .subscribe({
          next: (data) => {
            this.translate
              .get(['gameSection.updateRating.alert'])
              .subscribe((translations) => {
                Swal.fire({
                  icon: 'success',
                  title: translations['gameSection.updateRating.alert'],
                  showConfirmButton: true,
                }).then((result) => {
                  if (result.isConfirmed) {
                    this.router
                      .navigateByUrl('/', { skipLocationChange: true })
                      .then(() => {
                        this.router.navigate([`/game-section/${this.idGame}`]);
                      });
                  }
                });
              });
          },
          error: (err) => {
            console.log(err);
          },
        });
    }
  }

  updateGameDownloads() {
    if (this.sessionToken) {
      this.gameServ.updateGameDownloads(Number(this.idGame)).subscribe({
        next: (data) => {},
        error: (err) => {
          console.log(err);
        },
      });
    }
  }
}
