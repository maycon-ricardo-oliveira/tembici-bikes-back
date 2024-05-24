

import Filter from "../Filter";
import FilterOption from "../FilterOption";

export default class GoogleSheetFilter extends Filter {
	options: Array<FilterOption> = []

	constructor (header:string, queryName:string, type:string) {
		super(header, queryName, type)
	}

	make(responseOptions: any) {
		responseOptions.map((option:any) => {
			const filterOption = new FilterOption(
				option.id,
				option.name,
				option.description
			);

			this.options.push(filterOption);
		})

	}

	setFilter(option: string): any {

		this.options.push(new FilterOption(option, option, `Description for ${option}`));
	}

}