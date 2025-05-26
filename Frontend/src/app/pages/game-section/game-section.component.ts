import { Component, OnInit } from '@angular/core';
import { ContentBlocksService } from '../../services/content-blocks.service';
import { ActivatedRoute, Router } from '@angular/router';
import { ContentBlock } from '../../models/content_block/content_block';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-game-section',
  imports: [CommonModule],
  templateUrl: './game-section.component.html',
  styleUrls: ['./game-section.component.css'],
})
export class GameSectionComponent implements OnInit {
  // blocksData = [
  //   {
  //     id: 1,
  //     id_game: 1,
  //     block_type: 'text',
  //     content: 'BC:1 Texto corto 1',
  //     order_index: 1,
  //     block_number: 1,
  //     row: 1,
  //     col: 1,
  //   },
  //   {
  //     id: 2,
  //     id_game: 1,
  //     block_type: 'image',
  //     content: 'BC:1 mountain.jpg',
  //     order_index: 2,
  //     block_number: 1,
  //     row: 1,
  //     col: 2,
  //   },
  //   {
  //     id: 3,
  //     id_game: 1,
  //     block_type: 'image',
  //     content: 'BC:1 mountain.jpg',
  //     order_index: 2,
  //     block_number: 1,
  //     row: 1,
  //     col: 3,
  //   },
  //   {
  //     id: 4,
  //     id_game: 1,
  //     block_type: 'text',
  //     content: 'BC:1 Texto corto 4',
  //     order_index: 3,
  //     block_number: 1,
  //     row: 2,
  //     col: 1,
  //   },
  //   {
  //     id: 5,
  //     id_game: 1,
  //     block_type: 'text',
  //     content: 'BC:1 Texto corto 5',
  //     order_index: 4,
  //     block_number: 1,
  //     row: 2,
  //     col: 2,
  //   },
  //   {
  //     id: 6,
  //     id_game: 1,
  //     block_type: 'text',
  //     content: 'BC:1 Texto corto 6',
  //     order_index: 4,
  //     block_number: 1,
  //     row: 2,
  //     col: 3,
  //   },
  //   {
  //     id: 7,
  //     id_game: 1,
  //     block_type: 'text',
  //     content: 'BC:2 Texto corto 7',
  //     order_index: 4,
  //     block_number: 2,
  //     row: 1,
  //     col: 1,
  //   },
  //   {
  //     id: 8,
  //     id_game: 1,
  //     block_type: 'text',
  //     content: 'BC:2 Texto corto 8',
  //     order_index: 4,
  //     block_number: 2,
  //     row: 1,
  //     col: 2,
  //   },
  // ];

  isLoading = true;
  contentBlocksData: { [key: number]: ContentBlock[] } = {};
  numberOfContentBlocks: number[] = [];

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private contentBlockServ: ContentBlocksService
  ) {}

  ngOnInit(): void {
    this.getContentBlocks();
  }

  // SERVICES
  getContentBlocks() {
    const id = this.route.snapshot.paramMap.get('id') || '';
    if (id) {
      this.contentBlockServ.getContentBlocks(id).subscribe({
        next: (data) => {
          this.contentBlocksData = data;
          this.isLoading = false;
          this.numberOfContentBlocks = Object.keys(this.contentBlocksData).map(
            (key) => +key
          );
          console.log(this.contentBlocksData);
        },
        error: (err) => console.error(err),
      });
    }
  }
}
