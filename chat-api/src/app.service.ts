import { Injectable, OnApplicationBootstrap } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Channel, User, Avatar, UserSettings, UserStats } from 'db-interface/Core';
import { Logger } from '@nestjs/common';

@Injectable()
export class AppService implements OnApplicationBootstrap {
	constructor(
		@InjectRepository(Channel)
		private readonly channelsRepository: Repository<Channel>,
		@InjectRepository(User)
		private readonly usersRepository: Repository<User>,
	){}

	private logger: Logger = new Logger('onApplicationBootstrap');

	async createFakeUser(name: string, avatar: string) {
		let user = await this.usersRepository.findOneBy({ login: name })
		if (!user) {
			let user = new User(name);
			user.avatar = new Avatar(avatar);
			user.settings = new UserSettings;
			user.stats = new UserStats;
			this.usersRepository.save(user);
			this.logger.log(`[seed] Creation of fake user ${name}`);
		}
	}

	async onApplicationBootstrap() {
		let chan = await this.channelsRepository.findOne({ where: { name: "main_chan" } })
		if (!chan) {
			const channel = new Channel();
			channel.id = 1;
			channel.name = "main_chan";
			channel.unremovable = true;
			this.channelsRepository.save(channel);
			this.logger.log(`main_chan created`);
		}
		// this.createFakeUser("pmartinezi", "https://upload.wikimedia.org/wikipedia/commons/f/f1/PhilippeMartinez.jpg");
		// this.createFakeUser("mrandom", "https://res.cloudinary.com/demo/image/facebook/65646572251.jpg");
		// this.createFakeUser("gbaltring", "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxzZWFyY2h8MXx8cmFuZG9tJTIwcGVvcGxlfGVufDB8fDB8fA%3D%3D&w=1000&q=80");
		// this.createFakeUser("malik", "https://apiwp.thelocal.com/wp-content/uploads/2018/12/6d67730d16af04f3f956389d4cc244af808b8381c23b1e3d218ecd792de14fa8-616x431.jpg");
		// this.createFakeUser("myoyo", "https://risibank.fr/cache/medias/0/17/1767/176765/full.png");
	}

}
