import { Component, OnInit } from '@angular/core';
import { ContentBlocksService } from '../../services/content-blocks.service';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { ContentBlock } from '../../models/content_block/content_block';
import { CommonModule } from '@angular/common';
import { Game } from '../../models/game/game';
import { GamesService } from '../../services/games.service';
import { TranslatePipe } from '@ngx-translate/core';
import { PostsService } from '../../services/posts.service';
import { Post } from '../../models/post/post';

@Component({
  selector: 'app-post',
  imports: [CommonModule, RouterModule],
  templateUrl: './post.component.html',
  styles: ``,
})
export class PostComponent implements OnInit {

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private contentBlockServ: ContentBlocksService,
    private postServ: PostsService,
    private gameServ: GamesService
  ) {}
  ngOnInit(): void {
    this.getPost()
  }

 
// SERVICES
  getPost() {
    const id = this.route.snapshot.paramMap.get('id') || '';
    if (id) {
      this.postServ.getPost(id).subscribe({
        next: (data) => {
          console.log(data);
        },
        error: (err) => console.error(err),
      });
    }
  }
}
